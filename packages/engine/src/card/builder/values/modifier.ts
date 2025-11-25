import { isDefined, isString, type EmptyObject } from '@game/shared';
import type { GameEventName } from '../../../game/game.events';
import { checkCondition, type Condition } from '../conditions';
import { getAmount, type Amount } from './amount';
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
import {
  getArtifactInterceptor,
  getCardInterceptor,
  getMinionInterceptor,
  getSpellInterceptor,
  getUnitInterceptor,
  type ArtifactSerializedInterceptor,
  type CardSerializedInterceptor,
  type MinionSerializedInterceptor,
  type SpellSerializedInterceptor,
  type UnitSerializedInterceptor
} from './interceptor';
import { resolveUnitFilter, type UnitFilter } from '../filters/unit.filters';
import { resolveCardFilter, type CardFilter } from '../filters/card.filters';
import {
  CardAuraModifierMixin,
  UnitAuraModifierMixin
} from '../../../modifier/mixins/aura.mixin';
import type { Unit } from '../../../unit/unit.entity';
import { UnitEffectModifierMixin } from '../../../modifier/mixins/unit-effect.mixin';
import type { BuilderContext } from '../schema';

export type ModifierMixinData =
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
      params: UnitSerializedInterceptor;
    }
  | {
      type: 'card-interceptor';
      params: CardSerializedInterceptor;
    }
  | {
      type: 'minion-interceptor';
      params: MinionSerializedInterceptor;
    }
  | {
      type: 'spell-interceptor';
      params: SpellSerializedInterceptor;
    }
  | {
      type: 'artifact-interceptor';
      params: ArtifactSerializedInterceptor;
    }
  | {
      type: 'unit-aura';
      params: {
        elligibleUnits: Filter<UnitFilter>;
        modifier: ModifierData;
      };
    }
  | {
      type: 'card-aura';
      params: {
        elligibleCards: Filter<CardFilter>;
        modifier: ModifierData;
      };
    }
  | {
      type: 'unit-effect';
      params: {
        modifier: ModifierData;
      };
    };

export type ModifierData = {
  modifierType: string;
  name?: string | Keyword;
  description?: string | Keyword;
  icon?: string;
  mixins: ModifierMixinData[];
};

type ModifierContext = BuilderContext & { modifierData: ModifierData };

export const makeModifier = ({ game, card, modifierData, ...ctx }: ModifierContext) => {
  return new Modifier(modifierData.modifierType, game, card, {
    name: isDefined(modifierData.name)
      ? isString(modifierData.name)
        ? modifierData.name
        : modifierData.name?.name
      : undefined,
    description: isDefined(modifierData.description)
      ? isString(modifierData.description)
        ? modifierData.description
        : modifierData.description?.name
      : undefined,
    icon: modifierData.icon,
    mixins: modifierData.mixins.map(mixin => {
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
          return new UnitInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: getUnitInterceptor({
              ...ctx,
              game,
              card,
              params
            })
          });
        })
        .with({ type: 'card-interceptor' }, ({ params }) => {
          return new CardInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: getCardInterceptor({
              ...ctx,
              game,
              card,
              params
            })
          });
        })
        .with({ type: 'minion-interceptor' }, ({ params }) => {
          return new MinionInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: getMinionInterceptor({
              ...ctx,
              game,
              card,
              params
            })
          });
        })

        .with({ type: 'spell-interceptor' }, ({ params }) => {
          return new SpellInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: getSpellInterceptor({
              ...ctx,
              game,
              card,
              params
            })
          });
        })
        .with({ type: 'artifact-interceptor' }, ({ params }) => {
          return new ArtifactInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: getArtifactInterceptor({
              ...ctx,
              game,
              card,
              params
            })
          });
        })
        .with({ type: 'unit-aura' }, ({ params }) => {
          return new UnitAuraModifierMixin(game, {
            isElligible: candidate =>
              resolveUnitFilter({
                ...ctx,
                game,
                card,
                filter: params.elligibleUnits
              }).some(unit => unit.equals(candidate)),
            onGainAura: async candidate => {
              const auraModifier = makeModifier({
                ...ctx,
                game,
                card,
                modifierData: params.modifier
              }) as Modifier<Unit>;
              await candidate.modifiers.add(auraModifier);
            },
            onLoseAura: async candidate => {
              await candidate.modifiers.remove(params.modifier.modifierType);
            }
          });
        })
        .with({ type: 'card-aura' }, ({ params }) => {
          return new CardAuraModifierMixin(game, {
            isElligible: candidate =>
              resolveCardFilter({
                ...ctx,
                game,
                card,
                filter: params.elligibleCards,
                targets: []
              }).some(card => card.equals(candidate)),
            onGainAura: async candidate => {
              const auraModifier = makeModifier({
                ...ctx,
                game,
                card,
                modifierData: params.modifier
              }) as Modifier<AnyCard>;
              await candidate.modifiers.add(auraModifier);
            },
            onLoseAura: async candidate => {
              await candidate.modifiers.remove(params.modifier.modifierType);
            }
          });
        })
        .with({ type: 'unit-effect' }, ({ params }) => {
          return new UnitEffectModifierMixin(game, {
            async onApplied(unit) {
              const effectModifier = makeModifier({
                ...ctx,
                game,
                card,
                modifierData: params.modifier
              }) as Modifier<Unit>;
              await unit.modifiers.add(effectModifier);
            },
            async onRemoved(unit) {
              await unit.modifiers.remove(params.modifier.modifierType);
            }
          });
        })
        .exhaustive();
    })
  });
};
