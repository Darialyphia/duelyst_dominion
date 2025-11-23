import { match } from 'ts-pattern';
import type { CardFilter, EventSpecificCardFilter } from './filters/card.filters';
import type { Filter } from './filters/filter';
import type { PlayerFilter } from './filters/player.filter';
import type {
  EventspecificUnitFilter,
  UnitFilter,
  UnitFilterBase
} from './filters/unit.filters';
import type { Amount } from './values/amount';
import type { KeywordId } from '../card-keywords';
import type { Tag } from '../card.enums';
import type { CellFilter } from './filters/cell.filters';

export type Condition<
  T extends ConditionOverrides = {
    unit: EventspecificUnitFilter['type'];
    card: EventSpecificCardFilter['type'];
  }
> =
  | { type: 'active_player'; params: { player: Filter<PlayerFilter> } }
  | { type: 'target_exists'; params: { index: number } }
  | {
      type: 'player_mana';
      params: {
        player: Filter<PlayerFilter>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    }
  | {
      type: 'player_hp';
      params: {
        player: Filter<PlayerFilter>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    }
  | {
      type: 'player_cards_in_hand';
      params: {
        player: Filter<PlayerFilter>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    }
  | {
      type: 'unit_state';
      params: {
        unit: Filter<UnitFilterBase>;
        mode: 'none' | 'some' | 'all';
        attack?: {
          operator: NumericOperator;
          amount: Amount<T>;
        };
        hp?: {
          operator: NumericOperator;
          amount: Amount<T>;
        };
        keyword?: KeywordId;
        tag?: Tag;
        position?: Filter<CellFilter>;
      };
    }
  | {
      type: 'player_has_more_minions';
      params: {
        player: Filter<PlayerFilter>;
      };
    }
  | {
      type: 'counter_value';
      params: {
        operator: NumericOperator;
        amount: Amount<T>;
        name: string;
      };
    }
  | {
      type: 'cards_played_this_turn';
      params: {
        player: Filter<PlayerFilter>;
        card: Filter<CardFilter>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    };

export type ConditionOverrides = {
  unit?: UnitFilter['type'];
  card?: CardFilter['type'];
};

export type NumericOperator = 'equals' | 'more_than' | 'less_than';

export const matchNumericOperator = (
  amount: number,
  reference: number,
  operator: NumericOperator
) => {
  return match(operator)
    .with('equals', () => amount === reference)
    .with('less_than', () => amount < reference)
    .with('more_than', () => amount > reference)
    .exhaustive();
};
