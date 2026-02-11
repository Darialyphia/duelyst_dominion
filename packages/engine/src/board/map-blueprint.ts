import { type Nullable } from '@game/shared';
import type { Game } from '../game/game';

export type MapBlueprint = {
  id: string;
  rows: number;
  cols: number;
  cells: Array<
    Nullable<{
      tile?: string;
      player: 'p1' | 'p2' | null;
    }>
  >;
  onInit(game: Game): Promise<void>;
};

type CellBlueprint = MapBlueprint['cells'][number];
const p1: CellBlueprint = {
  player: 'p1'
};
const p2: CellBlueprint = {
  player: 'p2'
};
const neutral: CellBlueprint = {
  player: null
};

export const defaultMap: MapBlueprint = {
  id: 'default-map',
  cols: 5,
  rows: 5,
  // prettier-ignore
  cells: [
    p2,p2,p2,p2,p2,
    p2,p2,p2,p2,p2,
    neutral,neutral,neutral,neutral,neutral,
    p1,p1,p1,p1,p1,
    p1,p1,p1,p1,p1
  ],

  async onInit() {}
};
