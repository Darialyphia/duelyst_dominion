import type { NumericOperator } from '../conditions';
import type { Amount } from '../values/amount';
import type { BlueprintFilter } from './blueprint.filter';
import type { Filter } from './filter';
import type { PlayerFilter } from './player.filter';
import type { EventspecificUnitFilter } from './unit.filters';

export type CardFilterBase =
  | { type: 'any_card' }
  | { type: 'self' }
  | { type: 'minion' }
  | { type: 'spell' }
  | { type: 'artifact' }
  | { type: 'index_in_hand'; params: { index: number } }
  | { type: 'in_hand' }
  | { type: 'in_deck' }
  | { type: 'from_player'; params: { player: Filter<PlayerFilter> } }
  | {
      type: 'cost';
      params: {
        operator: NumericOperator;
        amount: Amount<{ unit: EventspecificUnitFilter['type'] }>;
      };
    }
  | { type: 'has_blueprint'; params: { blueprint: Filter<BlueprintFilter> } }
  | { type: 'has_tag'; params: { tag: string } };

export type EventSpecificCardFilter =
  | { type: 'drawn_card' }
  | { type: 'replaced_card' }
  | { type: 'card_replacement' };

export type CardFilter = CardFilterBase | EventSpecificCardFilter;
