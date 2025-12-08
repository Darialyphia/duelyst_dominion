import { Vec2, type Nullable, type Point } from '@game/shared';
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
  generalPositions: Point[];
  corners: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
  };
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
  cols: 9,
  rows: 5,
  // prettier-ignore
  cells: [
    p1, p1, p1, p1, neutral, p2, p2, p2, p2,
    p1, p1, p1, p1, neutral, p2, p2, p2, p2,
    p1, p1, p1, p1, neutral, p2, p2, p2, p2,
    p1, p1, p1, p1, neutral, p2, p2, p2, p2,
    p1, p1, p1, p1, neutral, p2, p2, p2, p2,
  ],
  generalPositions: [new Vec2(0, 2), new Vec2(8, 2)],
  corners: {
    topLeft: new Vec2(0, 0),
    topRight: new Vec2(8, 0),
    bottomLeft: new Vec2(0, 4),
    bottomRight: new Vec2(8, 4)
  },
  async onInit(game) {
    await game.tileSystem.addTile('mana-tile', new Vec2(4, 0));
    await game.tileSystem.addTile('mana-tile', new Vec2(4, 4));
    await game.tileSystem.addTile('mana-tile', new Vec2(5, 2));
  }
};
