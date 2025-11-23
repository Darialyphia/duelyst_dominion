import type { GameEventName } from '../../../game/game.events';
import type { Condition } from '../conditions';
import type { Amount } from './amount';
import type { SerializedAOE } from './aoe';

type NumericInterceptor<T extends string> = {
  key: T;
  amount: Amount;
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
      params: {
        key: string;
      };
    }
  | {
      type: 'spell-interceptor';
      params: {};
    }
  | {
      type: 'artifact-interceptor';
      params: {};
    };
