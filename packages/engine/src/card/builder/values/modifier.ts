import { isDefined, isString, type EmptyObject } from '@game/shared';
import type { GameEventName } from '../../../game/game.events';
import { checkCondition, type Condition } from '../conditions';
import { resolveCardFilter, type CardFilter } from '../filters/card.filters';
import { resolveUnitFilter, type UnitFilter } from '../filters/unit.filters';
import { getAmount, type Amount } from './amount';
import { getAOE, type SerializedAOE } from './aoe';
import { getTargeting, type SerializedTargeting } from './targeting';
import { resolvePlayerFilter, type PlayerFilter } from '../filters/player.filter';
import { type Keyword } from '../../card-keywords';
import type { Game } from '../../..';
import type { AnyCard } from '../../entities/card.entity';
import { Modifier } from '../../../modifier/modifier.entity';
import { match } from 'ts-pattern';
import { TogglableModifierMixin } from '../../../modifier/mixins/togglable.mixin';
import type { Filter } from '../filters/filter';
import { DurationModifierMixin } from '../../../modifier/mixins/duration.mixin';
import { RemoveOnDestroyedMixin } from '../../../modifier/mixins/remove-on-destroyed.mixin';
import { GameEventModifierMixin } from '../../../modifier/mixins/game-event.mixin';
import {
  ArtifactInterceptorModifierMixin,
  CardInterceptorModifierMixin,
  MinionInterceptorModifierMixin,
  SpellInterceptorModifierMixin,
  UnitInterceptorModifierMixin
} from '../../../modifier/mixins/interceptor.mixin';
import type { SerializedAction } from '../actions/action';
import { ACTION_LOOKUP } from '../actions/action-lookup';
import type { Unit } from '../../../unit/unit.entity';

type NumericInterceptor<T extends string> = {
  key: T;
  amount: Amount;
  operation: 'add' | 'scale' | 'set' | 'set-dynamic';
  condition: Filter<Condition>;
};

type BooleanInterceptor<T extends string> = {
  key: T;
  value: Filter<Condition>;
  condition: Filter<Condition>;
  ignoreIfFalse: boolean;
};

type AOEInterceptor<T extends string> = {
  key: T;
  shape: SerializedAOE;
  condition: Filter<Condition>;
};

type TargetingInterceptor<T extends string> = {
  key: T;
  targeting: SerializedTargeting;
  condition: Filter<Condition>;
};

type PlayerInterceptor<T extends string> = {
  key: T;
  player: Filter<PlayerFilter>;
  condition: Filter<Condition>;
};

export type SerializedModifierMixin =
  | {
      type: 'togglable';
      params: {
        condition: Filter<Condition>;
      };
    }
  | {
      type: 'duration';
      params: {
        duration: Amount;
      };
    }
  | {
      type: 'remove-on-destroyed';
      params: EmptyObject;
    }
  | {
      type: 'game-event';
      params: {
        eventName: GameEventName;
        actions: SerializedAction[];
        filter: Filter<Condition>;
        frequencyPerPlayerTurn: {
          enabled: boolean;
          frequency: number;
        };
        frequencyPerGameTurn: {
          enabled: boolean;
          frequency: number;
        };
      };
    }
  | {
      type: 'unit-interceptor';
      params:
        | NumericInterceptor<
            | 'atk'
            | 'maxHp'
            | 'movementReach'
            | 'maxAttacksPerTurn'
            | 'maxMovementsPerTurn'
          >
        | BooleanInterceptor<'canMove' | 'canMoveAfterAttacking' | 'canBeDestroyed'>
        | (BooleanInterceptor<
            | 'canAttack'
            | 'canCounterAttack'
            | 'canBeAttackTarget'
            | 'canBeCounterattackTarget'
          > & { unit: Filter<UnitFilter> })
        | (BooleanInterceptor<'canBeCardTarget'> & { card: Filter<CardFilter> })
        | AOEInterceptor<'attackAOEShape' | 'counterattackAOEShape'>
        | TargetingInterceptor<
            'attackTargetingPattern' | 'counterattackTargetingPattern'
          >;
    }
  | {
      type: 'card-interceptor';
      params:
        | NumericInterceptor<'manaCost'>
        | BooleanInterceptor<'canPlay' | 'canReplace'>
        | PlayerInterceptor<'player'>;
    }
  | {
      type: 'minion-interceptor';
      params:
        | NumericInterceptor<'atk' | 'maxHp'>
        | BooleanInterceptor<'hasSummoningSickness' | 'canPlay'>
        | TargetingInterceptor<'summonTargetingStrategy'>;
    }
  | {
      type: 'spell-interceptor';
      params: BooleanInterceptor<'canPlay'>;
    }
  | {
      type: 'artifact-interceptor';
      params: BooleanInterceptor<'canPlay'> | NumericInterceptor<'durability'>;
    };

export type SerializedModifier = {
  modifierType: string;
  name?: string | Keyword;
  description?: string | Keyword;
  icon?: string;
  mixins: SerializedModifierMixin[];
};

export const makeModifier = ({
  game,
  card,
  modifier
}: {
  game: Game;
  card: AnyCard;
  modifier: SerializedModifier;
}) => {
  return new Modifier(modifier.modifierType, game, card, {
    name: isDefined(modifier.name)
      ? isString(modifier.name)
        ? modifier.name
        : modifier.name?.name
      : undefined,
    description: isDefined(modifier.description)
      ? isString(modifier.description)
        ? modifier.description
        : modifier.description?.name
      : undefined,
    icon: modifier.icon,
    mixins: modifier.mixins.map(mixin => {
      return match(mixin)
        .with(
          { type: 'togglable' },
          ({ params }) =>
            new TogglableModifierMixin(game, () =>
              checkCondition({
                game,
                card,
                conditions: params.condition,
                targets: []
              })
            )
        )
        .with(
          { type: 'duration' },
          ({ params }) =>
            new DurationModifierMixin(
              game,
              getAmount({
                game,
                card,
                targets: [],
                amount: params.duration
              })
            )
        )
        .with({ type: 'remove-on-destroyed' }, () => new RemoveOnDestroyedMixin(game))
        .with(
          { type: 'game-event' },
          ({ params }) =>
            new GameEventModifierMixin(game, {
              eventName: params.eventName,
              handler: async event => {
                for (const action of params.actions) {
                  const ctor = ACTION_LOOKUP[action.type];
                  // @ts-expect-error
                  const instance = new ctor(action, {
                    game,
                    card,
                    targets: [],
                    event
                  });

                  await instance.execute();
                }
              },
              filter: event => {
                if (!params.filter) return true;
                return checkCondition({
                  game,
                  card,
                  conditions: params.filter,
                  targets: [],
                  event
                });
              },
              frequencyPerGameTurn: params.frequencyPerGameTurn.enabled
                ? params.frequencyPerGameTurn.frequency
                : undefined,
              frequencyPerPlayerTurn: params.frequencyPerPlayerTurn.enabled
                ? params.frequencyPerPlayerTurn.frequency
                : undefined
            })
        )
        .with({ type: 'unit-interceptor' }, ({ params }) => {
          const fixedValue =
            'operation' in params && params.operation === 'set'
              ? getAmount({
                  game,
                  card,
                  targets: [],
                  amount: params.amount
                })
              : undefined;

          return new UnitInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: (value, ctx) => {
              const shouldApply = checkCondition({
                game,
                card,
                conditions: params.condition,
                targets: []
              });
              if (!shouldApply) return value;

              return match(params)
                .with(
                  { key: 'atk' },
                  { key: 'maxHp' },
                  { key: 'movementReach' },
                  { key: 'maxAttacksPerTurn' },
                  { key: 'maxMovementsPerTurn' },
                  params => {
                    if (params.operation === 'set' && isDefined(fixedValue)) {
                      return fixedValue;
                    } else if (params.operation === 'set-dynamic') {
                      return getAmount({
                        game,
                        card,
                        targets: [],
                        amount: params.amount
                      });
                    } else if (params.operation === 'add') {
                      const amt = getAmount({
                        game,
                        card,
                        targets: [],
                        amount: params.amount
                      });
                      // @ts-expect-error ts cannot infer that value is number here
                      return value + amt;
                    } else if (params.operation === 'scale') {
                      const amt = getAmount({
                        game,
                        card,
                        targets: [],
                        amount: params.amount
                      });
                      // @ts-expect-error ts cannot infer that value is number here
                      return value * amt;
                    } else {
                      return value;
                    }
                  }
                )
                .with(
                  { key: 'canMove' },
                  { key: 'canMoveAfterAttacking' },
                  { key: 'canBeDestroyed' },
                  params => {
                    if (value === false && params.ignoreIfFalse) {
                      return value;
                    }
                    return checkCondition({
                      game,
                      card,
                      targets: [],
                      conditions: params.value
                    });
                  }
                )
                .with(
                  { key: 'canAttack' },
                  { key: 'canCounterAttack' },
                  { key: 'canBeAttackTarget' },
                  { key: 'canBeCounterattackTarget' },
                  params => {
                    if (value === false && params.ignoreIfFalse) return value;

                    const units = resolveUnitFilter({
                      game,
                      card,
                      filter: params.unit,
                      targets: []
                    });
                    const ctxUnit = ((ctx as any).target ??
                      (ctx as any).attacker) as Unit;
                    const unitMatches = units.some(u => u.equals(ctxUnit));
                    if (!unitMatches) return value;

                    return checkCondition({
                      game,
                      card,
                      targets: [],
                      conditions: params.value
                    });
                  }
                )
                .with({ key: 'canBeCardTarget' }, params => {
                  if (value === false && params.ignoreIfFalse) return value;

                  const cards = resolveCardFilter({
                    game,
                    card,
                    filter: params.card,
                    targets: []
                  });
                  const ctxCard = (ctx as any).card as AnyCard;
                  const cardMatches = cards.some(c => c.equals(ctxCard));
                  if (!cardMatches) return value;

                  return checkCondition({
                    game,
                    card,
                    targets: [],
                    conditions: params.value
                  });
                })
                .with(
                  { key: 'attackAOEShape' },
                  { key: 'counterattackAOEShape' },
                  params => {
                    return getAOE(params.shape);
                  }
                )
                .with(
                  { key: 'attackTargetingPattern' },
                  { key: 'counterattackTargetingPattern' },
                  params => {
                    return getTargeting({
                      game,
                      targeting: params.targeting,
                      card,
                      targets: []
                    });
                  }
                )
                .exhaustive();
            }
          });
        })
        .with({ type: 'card-interceptor' }, ({ params }) => {
          const fixedValue =
            'operation' in params && params.operation === 'set'
              ? getAmount({
                  game,
                  card,
                  targets: [],
                  amount: params.amount
                })
              : undefined;

          return new CardInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: (value, ctx) => {
              const shouldApply = checkCondition({
                game,
                card,
                conditions: params.condition,
                targets: []
              });
              if (!shouldApply) return value;

              return match(params)
                .with({ key: 'manaCost' }, params => {
                  if (params.operation === 'set' && isDefined(fixedValue)) {
                    return fixedValue;
                  } else if (params.operation === 'set-dynamic') {
                    return getAmount({
                      game,
                      card,
                      targets: [],
                      amount: params.amount
                    });
                  } else if (params.operation === 'add') {
                    const amt = getAmount({
                      game,
                      card,
                      targets: [],
                      amount: params.amount
                    });
                    // @ts-expect-error ts cannot infer that value is number here
                    return value + amt;
                  } else if (params.operation === 'scale') {
                    const amt = getAmount({
                      game,
                      card,
                      targets: [],
                      amount: params.amount
                    });
                    // @ts-expect-error ts cannot infer that value is number here
                    return value * amt;
                  } else {
                    return value;
                  }
                })
                .with({ key: 'canPlay' }, { key: 'canReplace' }, params => {
                  if (value === false && params.ignoreIfFalse) {
                    return value;
                  }
                  return checkCondition({
                    game,
                    card,
                    targets: [],
                    conditions: params.value
                  });
                })
                .with({ key: 'player' }, params => {
                  const [player] = resolvePlayerFilter({
                    game,
                    card,
                    filter: params.player,
                    targets: []
                  });
                  if (!player) return value;
                  return player;
                })
                .exhaustive();
            }
          });
        })
        .with({ type: 'minion-interceptor' }, ({ params }) => {
          const fixedValue =
            'operation' in params && params.operation === 'set'
              ? getAmount({
                  game,
                  card,
                  targets: [],
                  amount: params.amount
                })
              : undefined;

          return new MinionInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: value => {
              const shouldApply = checkCondition({
                game,
                card,
                conditions: params.condition,
                targets: []
              });
              if (!shouldApply) return value;

              return match(params)
                .with({ key: 'atk' }, { key: 'maxHp' }, params => {
                  if (params.operation === 'set' && isDefined(fixedValue)) {
                    return fixedValue;
                  } else if (params.operation === 'set-dynamic') {
                    return getAmount({
                      game,
                      card,
                      targets: [],
                      amount: params.amount
                    });
                  } else if (params.operation === 'add') {
                    const amt = getAmount({
                      game,
                      card,
                      targets: [],
                      amount: params.amount
                    });
                    // @ts-expect-error ts cannot infer that value is number here
                    return value + amt;
                  } else if (params.operation === 'scale') {
                    const amt = getAmount({
                      game,
                      card,
                      targets: [],
                      amount: params.amount
                    });
                    // @ts-expect-error ts cannot infer that value is number here
                    return value * amt;
                  } else {
                    return value;
                  }
                })
                .with({ key: 'hasSummoningSickness' }, { key: 'canPlay' }, params => {
                  if (value === false && params.ignoreIfFalse) {
                    return value;
                  }
                  return checkCondition({
                    game,
                    card,
                    targets: [],
                    conditions: params.value
                  });
                })
                .with({ key: 'summonTargetingStrategy' }, params => {
                  return getTargeting({
                    game,
                    targeting: params.targeting,
                    card,
                    targets: []
                  });
                })
                .exhaustive();
            }
          });
        })

        .with({ type: 'spell-interceptor' }, ({ params }) => {
          return new SpellInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: value => {
              const shouldApply = checkCondition({
                game,
                card,
                conditions: params.condition,
                targets: []
              });
              if (!shouldApply) return value;

              return match(params)
                .with({ key: 'canPlay' }, params => {
                  if (value === false && params.ignoreIfFalse) {
                    return value;
                  }
                  return checkCondition({
                    game,
                    card,
                    targets: [],
                    conditions: params.value
                  });
                })
                .exhaustive();
            }
          });
        })
        .with({ type: 'artifact-interceptor' }, ({ params }) => {
          const fixedValue =
            'operation' in params && params.operation === 'set'
              ? getAmount({
                  game,
                  card,
                  targets: [],
                  amount: params.amount
                })
              : undefined;
          return new ArtifactInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: value => {
              const shouldApply = checkCondition({
                game,
                card,
                conditions: params.condition,
                targets: []
              });
              if (!shouldApply) return value;

              return match(params)
                .with({ key: 'durability' }, params => {
                  if (params.operation === 'set' && isDefined(fixedValue)) {
                    return fixedValue;
                  } else if (params.operation === 'set-dynamic') {
                    return getAmount({
                      game,
                      card,
                      targets: [],
                      amount: params.amount
                    });
                  } else if (params.operation === 'add') {
                    const amt = getAmount({
                      game,
                      card,
                      targets: [],
                      amount: params.amount
                    });
                    // @ts-expect-error ts cannot infer that value is number here
                    return value + amt;
                  } else if (params.operation === 'scale') {
                    const amt = getAmount({
                      game,
                      card,
                      targets: [],
                      amount: params.amount
                    });
                    // @ts-expect-error ts cannot infer that value is number here
                    return value * amt;
                  } else {
                    return value;
                  }
                })
                .with({ key: 'canPlay' }, params => {
                  if (value === false && params.ignoreIfFalse) {
                    return value;
                  }
                  return checkCondition({
                    game,
                    card,
                    targets: [],
                    conditions: params.value
                  });
                })
                .exhaustive();
            }
          });
        })
        .exhaustive();
    })
  });
};
