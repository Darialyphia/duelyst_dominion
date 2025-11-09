import { isDefined, type Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';
import { defineHex, Grid, Orientation, rectangle, spiral } from 'honeycomb-grid';

type SerializedRing = {
  type: 'ring';
  targetingType: TargetingType;
  params: { size: number };
};

type RingAoeShapeOptions = {
  size: number;
  override?: Point;
};

export const RingHex = defineHex({
  dimensions: {
    width: 10,
    height: 10
  },
  orientation: Orientation.FLAT
});

const ringGrid = new Grid(RingHex, rectangle({ width: 30, height: 30 }));

export class RingAOEShape implements AOEShape<SerializedRing> {
  static fromJSON(type: TargetingType, options: RingAoeShapeOptions): RingAOEShape {
    return new RingAOEShape(type, options);
  }

  readonly type = 'ring' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: RingAoeShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        size: this.options.size
      }
    };
  }

  getArea([point]: [Point]): Point[] {
    return ringGrid
      .traverse(
        spiral({ radius: this.options.size, start: { col: point.x, row: point.y } })
      )
      .toArray()
      .map(hex => {
        if (hex.col === point.x && hex.row === point.y) return null;
        return { x: hex.col, y: hex.row };
      })
      .filter(isDefined);
  }
}
