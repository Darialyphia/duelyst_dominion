import type { KeywordId } from '../../card-keywords';
import type { Tag } from '../../card.enums';
import type { NumericOperator } from '../conditions';
import type { Amount } from '../values/amount';
import type { BlueprintFilter } from './blueprint.filter';
import type { EventSpecificCardFilter } from './card.filters';
import type { CellFilter } from './cell.filters';
import type { Filter } from './filter';

export type UnitFilterBase =
  | { type: 'any_unit' }
  | { type: 'is_self'; params: { not: boolean } }
  | { type: 'is_general'; params: { not: boolean } }
  | { type: 'is_minion'; params: { not: boolean } }
  | { type: 'is_ally'; params: { not: boolean } }
  | { type: 'is_enemy'; params: { not: boolean } }
  | {
      type: 'is_nearby';
      params: {
        unit?: Filter<UnitFilter>;
        cell?: Filter<CellFilter>;
        not: boolean;
      };
    }
  | { type: 'is_in_front'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_nearest_in_front'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_behind'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_nearest_behind'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_above'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_nearest_above'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_below'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_nearest_below'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_manual_target'; params: { index: number; not: boolean } }
  | { type: 'is_manual_target_general'; params: { index: number; not: boolean } }
  | { type: 'is_same_row'; params: { cell: Filter<CellFilter>; not: boolean } }
  | { type: 'is_same_column'; params: { cell: Filter<CellFilter>; not: boolean } }
  | { type: 'has_keyword'; params: { keyword: KeywordId; not: boolean } }
  | {
      type: 'has_blueprint';
      params: { blueprint: Filter<BlueprintFilter>; not: boolean };
    }
  | { type: 'has_tag'; params: { tag: Tag; not: boolean } }
  | {
      type: 'has_attack';
      params: {
        amount: Amount<{
          unit: EventspecificUnitFilter['type'];
          card: EventSpecificCardFilter['type'];
        }>;
        operator: NumericOperator;
        not: boolean;
      };
    }
  | {
      type: 'has_hp';
      params: {
        amount: Amount<{
          unit: EventspecificUnitFilter['type'];
          card: EventSpecificCardFilter['type'];
        }>;
        operator: NumericOperator;
        not: boolean;
      };
    }
  | {
      type: 'has_lowest_attack';
      params: { not: false };
    }
  | {
      type: 'has_highest_attack';
      params: { not: false };
    }
  | { type: 'is_exhausted'; params: { not: boolean } }
  | { type: 'is_on_cell'; params: { cell: Filter<CellFilter>; not: boolean } }
  | { type: 'is_on_own_side_of_board'; params: { not: boolean } }
  | { type: 'is_on_opponent_side_of_board'; params: { not: boolean } }
  | { type: 'artifact_owner'; params: { not: boolean } }
  | { type: 'in_card_aoe'; params: { not: boolean } };

export type EventspecificUnitFilter =
  | { type: 'attack_target'; params: { not: boolean } }
  | { type: 'attack_source'; params: { not: boolean } }
  | { type: 'healing_target'; params: { not: boolean } }
  | { type: 'healing_source'; params: { not: boolean } }
  | { type: 'moved_unit'; params: { not: boolean } }
  | { type: 'played_unit'; params: { not: boolean } }
  | { type: 'destroyed_unit'; params: { not: boolean } };

export type UnitFilter = UnitFilterBase | EventspecificUnitFilter;
