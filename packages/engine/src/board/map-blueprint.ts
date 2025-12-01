import { Vec2, type Nullable, type Point } from '@game/shared';

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
  // prettier-ignore
  cells: [
    p1(), p1(), p1(), p1(), neutral(), p1(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p1(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p1(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p1(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p1(), p2(), p2(), p2(),
  ],
  generalPositions: [new Vec2(0, 2), new Vec2(8, 2)],
  corners: {
    topLeft: new Vec2(0, 0),
    topRight: new Vec2(8, 0),
    bottomLeft: new Vec2(0, 4),
    bottomRight: new Vec2(8, 4)
  }
};
