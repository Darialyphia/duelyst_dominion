import { Vec2, type Point } from '@game/shared';

export type MapBlueprint = {
  id: string;
  rows: number;
  cols: number;
  cells: Array<{
    tile?: string;
    player: 'p1' | 'p2' | null;
  }>;
  generalPositions: Point[];
  boundaries: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
  };
};

type CellBlueprint = MapBlueprint['cells'][number];
const p1 = (tile?: string): CellBlueprint => ({
  tile,
  player: 'p1'
});
const p2 = (tile?: string): CellBlueprint => ({
  tile,
  player: 'p2'
});
const neutral = (tile?: string): CellBlueprint => ({
  tile,
  player: null
});

export const defaultMap: MapBlueprint = {
  id: 'default-map',
  cols: 9,
  rows: 5,
  boundaries: {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 8, y: 0 },
    bottomLeft: { x: 0, y: 4 },
    bottomRight: { x: 8, y: 4 }
  },
  // prettier-ignore
  cells: [
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
  ],
  generalPositions: [new Vec2(0, 2), new Vec2(8, 2)]
};
