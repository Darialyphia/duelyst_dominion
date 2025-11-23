import type { Amount } from '../values/amount';
import type { EventSpecificCardFilter } from './card.filters';
import type { Filter } from './filter';
import type { EventspecificUnitFilter, UnitFilter } from './unit.filters';

export type CellFilterBase =
  | { type: 'any_cell' }
  | { type: 'is_empty' }
  | { type: 'has_unit'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_at'; params: { x: number; y: number; z: number } }
  | {
      type: 'is_nearby';
      params: { unit?: Filter<UnitFilter>; cell?: Filter<CellFilter> };
    }
  | { type: 'is_in_front'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_behind'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_above'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_same_row'; params: { cell: Filter<CellFilter> } }
  | { type: 'is_same_column'; params: { cell: Filter<CellFilter> } }
  | { type: 'is_below'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_manual_target'; params: { index: number } }
  | { type: 'is_top_right_corner' }
  | { type: 'is_top_left_corner' }
  | { type: 'is_bottom_right_corner' }
  | { type: 'is_bottom_left_corner' }
  | {
      type: 'in_area';
      params: {
        topLeft: Filter<CellFilterBase>;
        size: { width: number; height: number };
      };
    }
  | {
      type: 'within_cells';
      params: {
        cell: Filter<CellFilter>;
        amount: Amount<{
          unit: EventspecificUnitFilter['type'];
          card: EventSpecificCardFilter['type'];
        }>;
      };
    }
  | {
      type: 'is_relative_from';
      params: {
        origin: Filter<CellFilter>;
        x: number;
        y: number;
        forwards: number;
        backwards: number;
      };
    }
  | { type: 'in_card_aoe'; params: { not: boolean } };

export type EventSpecificCellFilter =
  | { type: 'moved_unit_old_position' }
  | { type: 'moved_unit_new_position' }
  | { type: 'moved_path' }
  | { type: 'attack_target_position' }
  | { type: 'attack_source_position' }
  | { type: 'heal_target_position' }
  | { type: 'heal_source_position' }
  | { type: 'summon_target' };

export type CellFilter = CellFilterBase | EventSpecificCellFilter;
