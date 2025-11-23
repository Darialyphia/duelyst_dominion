import type { EmptyObject } from '@game/shared';
import type { GameEventName } from '../../../game/game.events';
import type { Condition } from '../conditions';
import type { CardFilter } from '../filters/card.filters';
import type { UnitFilter } from '../filters/unit.filters';
import type { Amount } from './amount';
import type { SerializedAOE } from './aoe';
import type { SerializedTargeting } from './targeting';
import type { PlayerFilter } from '../filters/player.filter';

type NumericInterceptor<T extends string> = {
  key: T;
  amount: Amount;
  dynamic: boolean;
  operation: 'add' | 'scale' | 'set';
  condition: Condition;
};

type BooleanInterceptor<T extends string> = {
  key: T;
  value: boolean;
  condition: Condition;
};

type AOEInterceptor<T extends string> = {
  key: T;
  shape: SerializedAOE;
  condition: Condition;
};

type TargetingInterceptor<T extends string> = {
  key: T;
  targeting: SerializedTargeting;
  condition: Condition;
};

type PlayerInterceptor<T extends string> = {
  key: T;
  playerId: PlayerFilter;
  condition: Condition;
};

export type SerializedModifierMixin =
  | {
      type: 'togglable';
      params: {
        condition: Condition;
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
        filter: Condition;
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
            'atk' | 'maxHp' | 'movementReach' | 'maxAttacksPerTurn' | 'maxMovesPerTurn'
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
      type: 'general-interceptor';
      params: NumericInterceptor<'atk' | 'maxHp' | 'cmd'>;
    }
  | {
      type: 'spell-interceptor';
      params: BooleanInterceptor<'canPlay'>;
    }
  | {
      type: 'artifact-interceptor';
      params: BooleanInterceptor<'canPlay'> | NumericInterceptor<'durability'>;
    };
