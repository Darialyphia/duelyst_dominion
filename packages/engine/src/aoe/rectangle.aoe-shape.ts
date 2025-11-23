import type { Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

export type SerializedRectangleAOE = {
  type: 'rectangle';
  targetingType: TargetingType;
  params: { width: number; height: number };
};

type RectangleAoeShapeOptions = {
  width: number;
  height: number;
};
export class RectangleAOEShape implements AOEShape<SerializedRectangleAOE> {
  static fromJSON(
    type: TargetingType,
    options: RectangleAoeShapeOptions
  ): RectangleAOEShape {
    return new RectangleAOEShape(type, options);
  }

  readonly type = 'rectangle' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: RectangleAoeShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        width: this.options.width,
        height: this.options.height
      }
    };
  }

  getArea([point]: [Point]): Point[] {
    const area: Point[] = [];
    if (!point) return area;

    for (let dx = 0; dx < this.options.width; dx++) {
      for (let dy = 0; dy < this.options.height; dy++) {
        area.push({ x: point.x + dx, y: point.y + dy });
      }
    }

    return area;
  }
}
