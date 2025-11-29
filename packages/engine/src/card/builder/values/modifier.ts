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
import type { Action, ActionData } from '../actions/action';
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
import { KeywordModifierMixin } from '../../../modifier/mixins/keyword.mixin';

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
      type: 'keyword';
      params: {
        keyword: Keyword;
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
        actions: ActionData[];
        filter: Filter<Condition>;
        frequencyPerPlayerTurn: {
          enabled: boolean;
          frequency?: number;
        };
        frequencyPerGameTurn: {
          enabled: boolean;
          frequency?: number;
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
  isRemovable?: boolean;
  mixins: ModifierMixinData[];
};

type ModifierContext = BuilderContext & { modifierData: ModifierData };

export const resolveModifier = ({ modifierData, ...ctx }: ModifierContext) => {
  const modifier = new Modifier(modifierData.modifierType, ctx.game, ctx.card, {
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
    isRemovable: modifierData.isRemovable ?? true,
    mixins: []
  });

  for (const mixinData of modifierData.mixins) {
    const mixin = match(mixinData)
      .with(
        { type: 'togglable' },
        ({ params }) =>
          new TogglableModifierMixin(ctx.game, () =>
            checkCondition({
              ...ctx,
              conditions: params.condition,
              modifier
            })
          )
      )
      .with(
        { type: 'duration' },
        ({ params }) =>
          new DurationModifierMixin(
            ctx.game,
            getAmount({
              ...ctx,
              targets: [],
              modifier,
              amount: params.duration
            })
          )
      )
      .with(
        { type: 'keyword' },
        ({ params }) => new KeywordModifierMixin(ctx.game, params.keyword)
      )
      .with({ type: 'remove-on-destroyed' }, () => new RemoveOnDestroyedMixin(ctx.game))
      .with(
        { type: 'game-event' },
        ({ params }) =>
          new GameEventModifierMixin(ctx.game, {
            eventName: params.eventName,
            handler: async event => {
              for (const action of params.actions) {
                const ctor = ACTION_LOOKUP[action.type];
                // ts-ignore to avoid complex typing issues
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const instance: Action<any> = new ctor(action as any, {
                  ...ctx,
                  event,
                  modifier
                }) as Action<any>;

                await instance.execute();
              }
            },
            filter: event => {
              if (!params.filter) return true;
              const passesFilter = checkCondition({
                ...ctx,
                event,
                conditions: params.filter,
                modifier
              });
              return passesFilter;
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
        return new UnitInterceptorModifierMixin(ctx.game, {
          key: params.key,
          interceptor: getUnitInterceptor({
            ...ctx,
            params
          })
        });
      })
      .with({ type: 'card-interceptor' }, ({ params }) => {
        return new CardInterceptorModifierMixin(ctx.game, {
          key: params.key,
          interceptor: getCardInterceptor({
            ...ctx,
            params
          })
        });
      })
      .with({ type: 'minion-interceptor' }, ({ params }) => {
        return new MinionInterceptorModifierMixin(ctx.game, {
          key: params.key,
          interceptor: getMinionInterceptor({
            ...ctx,
            params
          })
        });
      })
      .with({ type: 'spell-interceptor' }, ({ params }) => {
        return new SpellInterceptorModifierMixin(ctx.game, {
          key: params.key,
          interceptor: getSpellInterceptor({
            ...ctx,
            params
          })
        });
      })
      .with({ type: 'artifact-interceptor' }, ({ params }) => {
        return new ArtifactInterceptorModifierMixin(ctx.game, {
          key: params.key,
          interceptor: getArtifactInterceptor({
            ...ctx,
            params
          })
        });
      })
      .with({ type: 'unit-aura' }, ({ params }) => {
        return new UnitAuraModifierMixin(ctx.game, {
          isElligible: candidate =>
            resolveUnitFilter({
              ...ctx,
              filter: params.elligibleUnits
            }).some(unit => unit.equals(candidate)),
          onGainAura: async candidate => {
            const auraModifier = resolveModifier({
              ...ctx,
              modifierData: { ...params.modifier, isRemovable: false }
            }) as Modifier<Unit>;
            await candidate.modifiers.add(auraModifier);
          },
          onLoseAura: async candidate => {
            await candidate.modifiers.remove(params.modifier.modifierType, {
              force: true
            });
          }
        });
      })
      .with({ type: 'card-aura' }, ({ params }) => {
        return new CardAuraModifierMixin(ctx.game, {
          isElligible: candidate =>
            resolveCardFilter({
              ...ctx,
              filter: params.elligibleCards,
              targets: []
            }).some(card => card.equals(candidate)),
          onGainAura: async candidate => {
            const auraModifier = resolveModifier({
              ...ctx,
              modifierData: { ...params.modifier, isRemovable: false }
            }) as Modifier<AnyCard>;
            await candidate.modifiers.add(auraModifier);
          },
          onLoseAura: async candidate => {
            await candidate.modifiers.remove(params.modifier.modifierType, {
              force: true
            });
          }
        });
      })
      .with({ type: 'unit-effect' }, ({ params }) => {
        return new UnitEffectModifierMixin(ctx.game, {
          async onApplied(unit) {
            const effectModifier = resolveModifier({
              ...ctx,
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

    modifier.addMixin(mixin);
  }

  return modifier;
};
