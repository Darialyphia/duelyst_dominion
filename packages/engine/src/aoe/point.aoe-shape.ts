import type { EmptyObject, Point } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';

type SerializedPoint = {
  type: 'point';
  targetingType: TargetingType;
  params: EmptyObject;
};

type PointAoeShapeOptions = {
  override?: Point;
};
export class PointAOEShape implements AOEShape<SerializedPoint> {
  static fromJSON(type: TargetingType, options?: PointAoeShapeOptions): PointAOEShape {
    return new PointAOEShape(type, options ?? {});
  }

  readonly type = 'point' as const;

  constructor(
    readonly targetingType: TargetingType,
    private readonly options: PointAoeShapeOptions
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {}
    };
  }

  getArea([point]: [Point]): Point[] {
    const area = this.options.override ?? point;
    if (!area) return [];

    return [area];
  }
}
