import type { IndexedRecord } from '@game/shared';
import type { TileBlueprint } from '../tile-blueprint';
import { keyBy } from 'lodash-es';
import { manaTile } from './mana-tile';

export const CARDS_DICTIONARY = {
  ...keyBy([manaTile], 'id')
} as const satisfies IndexedRecord<TileBlueprint, 'id'>;
