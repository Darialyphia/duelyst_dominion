import { match } from 'ts-pattern';
import type { Game } from '../../../game/game';
import type { AnyCard } from '../../entities/card.entity';
import { checkCondition, type Condition } from '../conditions';
import { resolveCardFilter, type CardFilter } from '../filters/card.filters';
import type { Filter } from '../filters/filter';
import { resolvePlayerFilter, type PlayerFilter } from '../filters/player.filter';
import { resolveUnitFilter, type UnitFilter } from '../filters/unit.filters';
import { getAmount, type Amount } from './amount';
import { getTargeting, type SerializedTargeting } from './targeting';
import { isDefined, type AnyObject } from '@game/shared';
import type { Unit } from '../../../unit/unit.entity';
import { getAOE, type SerializedAOE } from './aoe';
import type { BuilderContext } from '../schema';

export type NumericInterceptor<T extends string> = {
  key: T;
  amount: Amount;
  operation: 'add' | 'scale' | 'set' | 'set-dynamic';
  condition: Filter<Condition>;
};

export type BooleanInterceptor<T extends string> = {
  key: T;
  value: Filter<Condition>;
  condition: Filter<Condition>;
  ignoreIfFalse: boolean;
};

export type AOEInterceptor<T extends string> = {
  key: T;
  shape: SerializedAOE;
  condition: Filter<Condition>;
};

export type TargetingInterceptor<T extends string> = {
  key: T;
  targeting: SerializedTargeting;
  condition: Filter<Condition>;
};

type PlayerInterceptor<T extends string> = {
  key: T;
  player: Filter<PlayerFilter>;
  condition: Filter<Condition>;
};

export type UnitSerializedInterceptor =
  | NumericInterceptor<
      'atk' | 'maxHp' | 'movementReach' | 'maxAttacksPerTurn' | 'maxMovementsPerTurn'
    >
  | BooleanInterceptor<'canMove' | 'canMoveAfterAttacking' | 'canBeDestroyed'>
  | (BooleanInterceptor<
      'canAttack' | 'canCounterAttack' | 'canBeAttackTarget' | 'canBeCounterattackTarget'
    > & { unit: Filter<UnitFilter> })
  | (BooleanInterceptor<'canBeCardTarget'> & { card: Filter<CardFilter> })
  | AOEInterceptor<'attackAOEShape' | 'counterattackAOEShape'>
  | TargetingInterceptor<'attackTargetingPattern' | 'counterattackTargetingPattern'>;

export type CardSerializedInterceptor =
  | NumericInterceptor<'manaCost'>
  | BooleanInterceptor<'canPlay' | 'canReplace'>
  | PlayerInterceptor<'player'>;

export type MinionSerializedInterceptor =
  | NumericInterceptor<'atk' | 'maxHp'>
  | BooleanInterceptor<'hasSummoningSickness' | 'canPlay'>
  | TargetingInterceptor<'summonTargetingStrategy'>;

export type SpellSerializedInterceptor = BooleanInterceptor<'canPlay'>;

export type ArtifactSerializedInterceptor =
  | BooleanInterceptor<'canPlay'>
  | NumericInterceptor<'durability'>;

type InterceptorContext<T> = BuilderContext & { params: T };

export const getUnitInterceptor = ({
  game,
  card,
  params
}: InterceptorContext<UnitSerializedInterceptor>) => {
  const fixedValue =
    'operation' in params && params.operation === 'set'
      ? getAmount({
          game,
          card,
          targets: [],
          amount: params.amount
        })
      : undefined;

  return (value: any, ctx: AnyObject) => {
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
            return value + amt;
          } else if (params.operation === 'scale') {
            const amt = getAmount({
              game,
              card,
              targets: [],
              amount: params.amount
            });
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
          const ctxUnit = ((ctx as any).target ?? (ctx as any).attacker) as Unit;
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
      .with({ key: 'attackAOEShape' }, { key: 'counterattackAOEShape' }, params => {
        return getAOE(params.shape);
      })
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
  };
};

export const getCardInterceptor = ({
  game,
  card,
  params
}: InterceptorContext<CardSerializedInterceptor>) => {
  const fixedValue =
    'operation' in params && params.operation === 'set'
      ? getAmount({
          game,
          card,
          targets: [],
          amount: params.amount
        })
      : undefined;

  return (value: any) => {
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
          return value + amt;
        } else if (params.operation === 'scale') {
          const amt = getAmount({
            game,
            card,
            targets: [],
            amount: params.amount
          });
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
  };
};

export const getMinionInterceptor = ({
  game,
  card,
  params
}: InterceptorContext<MinionSerializedInterceptor>) => {
  const fixedValue =
    'operation' in params && params.operation === 'set'
      ? getAmount({
          game,
          card,
          targets: [],
          amount: params.amount
        })
      : undefined;

  return (value: any) => {
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
          return value + amt;
        } else if (params.operation === 'scale') {
          const amt = getAmount({
            game,
            card,
            targets: [],
            amount: params.amount
          });
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
  };
};

export const getSpellInterceptor = ({
  game,
  card,
  params
}: InterceptorContext<SpellSerializedInterceptor>) => {
  return (value: any) => {
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
  };
};

export const getArtifactInterceptor = ({
  game,
  card,
  params
}: InterceptorContext<ArtifactSerializedInterceptor>) => {
  const fixedValue =
    'operation' in params && params.operation === 'set'
      ? getAmount({
          game,
          card,
          targets: [],
          amount: params.amount
        })
      : undefined;

  return (value: any) => {
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
          return value + amt;
        } else if (params.operation === 'scale') {
          const amt = getAmount({
            game,
            card,
            targets: [],
            amount: params.amount
          });
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
  };
};
