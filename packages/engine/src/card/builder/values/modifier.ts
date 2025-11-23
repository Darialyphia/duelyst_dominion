import { isDefined, isString, type EmptyObject } from '@game/shared';
import type { GameEventName } from '../../../game/game.events';
import { checkCondition, type Condition } from '../conditions';
import type { CardFilter } from '../filters/card.filters';
import type { UnitFilter } from '../filters/unit.filters';
import { getAmount, type Amount } from './amount';
import type { SerializedAOE } from './aoe';
import type { SerializedTargeting } from './targeting';
import type { PlayerFilter } from '../filters/player.filter';
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

type NumericInterceptor<T extends string> = {
  key: T;
  amount: Amount;
  dynamic: boolean;
  operation: 'add' | 'scale' | 'set';
  condition: Filter<Condition>;
};

type BooleanInterceptor<T extends string> = {
  key: T;
  value: boolean;
  condition: Filter<Condition>;
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
  playerId: PlayerFilter;
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
        actions: any[];
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
          > & { unit: UnitFilter })
        | (BooleanInterceptor<'canBeCardTarget'> & { card: CardFilter })
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
              handler: event => {},
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
        .with(
          { type: 'unit-interceptor' },
          ({ params }) =>
            new UnitInterceptorModifierMixin(game, {
              key: params.key,
              interceptor: (value, ctx) => {
                return value;
              }
            })
        )
        .with({ type: 'card-interceptor' }, ({ params }) => {
          return new CardInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: (value, ctx) => value
          });
        })
        .with({ type: 'minion-interceptor' }, ({ params }) => {
          return new MinionInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: (value, ctx) => value
          });
        })

        .with({ type: 'spell-interceptor' }, ({ params }) => {
          return new SpellInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: (value, ctx) => value
          });
        })
        .with({ type: 'artifact-interceptor' }, ({ params }) => {
          return new ArtifactInterceptorModifierMixin(game, {
            key: params.key,
            interceptor: (value, ctx) => value
          });
        })
        .exhaustive();
    })
  });
};
