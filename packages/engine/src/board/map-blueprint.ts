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
  shrinePositions: Point[];
  teleporters: Array<{
    id: string;
    color: string;
    gates: [Point, Point];
  }>;
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
  cols: 13,
  rows: 7,
  // prettier-ignore
  cells: [
    null, null, null, null, null, p2(), p2(), p2(), p2(), null, null, null, null,
    null, null, p2(), p2(), p2(), p2(), p2(), p2(), p2(), p2(), null, null, null,
    null, p2(), p2(), p2(), p2(), p2(), p2(), p2(), p2(), p2(), p2(), p2(), null,
    neutral(), p1(), neutral(), p1(), neutral(), p1(), neutral(), p1(), neutral(), p1(), neutral(), p1(), neutral(),
    null, null, p1(), p1(), p1(), p1(), null, p1(), p1(), p1(), p1(), null, null,
    null, null, null, null, p1(), p1(), p1(), p1(), p1(), null, p1(), null, null,
    null, null, null, null, p1(), null, p1(), null, null, null, null, null, null


  ],
  generalPositions: [new Vec2(6, 6), new Vec2(6, 0)],
  shrinePositions: [new Vec2(2, 3), new Vec2(6, 3), new Vec2(10, 3)],
  teleporters: [
    { id: 'green', color: 'green', gates: [new Vec2(0, 3), new Vec2(12, 3)] },
    { id: 'purple', color: 'purple', gates: [new Vec2(2, 1), new Vec2(4, 6)] },
    { id: 'yellow', color: 'yellow', gates: [new Vec2(8, 0), new Vec2(10, 5)] }
  ]
};
