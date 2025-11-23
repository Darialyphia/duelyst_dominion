import type { EmptyObject } from '@game/shared';
import type { KeywordId } from '../../card-keywords';
import type { Faction } from '../../card.enums';
import type { NumericOperator } from '../conditions';
import type { Amount } from '../values/amount';
import type { CardFilter } from './card.filters';
import type { Filter } from './filter';
import type { EventspecificUnitFilter, UnitFilter } from './unit.filters';

export type BlueprintFilter =
  | { type: 'static'; params: { blueprints: string[] } }
  | { type: 'from_unit'; params: { unit: Filter<UnitFilter> } }
  | { type: 'from_card'; params: { card: Filter<CardFilter> } }
  | { type: 'minion'; params: EmptyObject }
  | { type: 'spell'; params: EmptyObject }
  | { type: 'artifact'; params: EmptyObject }
  | {
      type: 'cost';
      params: {
        operator: NumericOperator;
        amount: Amount<{ unit: EventspecificUnitFilter['type'] }>;
      };
    }
  | { type: 'has_tag'; params: { tag: string } }
  | { type: 'has_keyword'; params: { keyword: KeywordId } }
  | { type: 'from_faction'; params: { factions: (Faction | null)[] } };
