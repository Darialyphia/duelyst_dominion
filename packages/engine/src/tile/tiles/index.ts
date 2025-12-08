import type { IndexedRecord } from '@game/shared';
import type { TileBlueprint } from '../tile-blueprint';
import { keyBy } from 'lodash-es';
import { manaTile } from './mana-tile';
import { manaTileDepleted } from './mana-tile-depleted';
import { shadowCreep } from './shadow-creep';

export const TILES_DICTIONARY = {
  ...keyBy([manaTile, manaTileDepleted, shadowCreep], 'id')
} as const satisfies IndexedRecord<TileBlueprint, 'id'>;
