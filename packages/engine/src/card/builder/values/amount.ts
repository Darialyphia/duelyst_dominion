import type { ConditionOverrides } from '../conditions';
import type { CardFilterBase, EventSpecificCardFilter } from '../filters/card.filters';
import type { Filter } from '../filters/filter';
import type { PlayerFilter } from '../filters/player.filter';
import type { EventspecificUnitFilter, UnitFilterBase } from '../filters/unit.filters';

export type Amount<T extends ConditionOverrides> =
  | {
      type: 'fixed';
      params: { value: number };
    }
  | {
      type: 'cards_in_hands';
      params: {
        player: Filter<PlayerFilter>;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'attack';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'lowest_attack';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'highest_attack';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'maxHp';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'hp';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'lowest_hp';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'highest_hp';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'cost';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'card_played_since_last_turn';
      params: {
        card: Filter<
          CardFilterBase | Extract<EventSpecificCardFilter, { type: T['card'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'equiped_artifact_count';
      params: {
        player: Filter<PlayerFilter>;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'destroyed_units';
      params: {
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'missing_cards_in_hand';
      params: {
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'count_of_units';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    };
