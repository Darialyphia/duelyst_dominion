import type { AnyObject } from '@game/shared';
import type { GenericAOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';
import { PointAOEShape } from './point.aoe-shape';
import { CompositeAOEShape } from './composite.aoe-shape';
import { RingAOEShape } from './ring.aoe-shape';
import { RectangleAOEShape } from './rectangle.aoe-shape';
import { NoAOEShape } from './no-aoe.aoe-shape';

const dict = {
  point: () => PointAOEShape,
  composite: () => CompositeAOEShape,
  ring: () => RingAOEShape,
  rectangle: () => RectangleAOEShape,
  noAOE: () => NoAOEShape
} as const;

export type AOEType = keyof typeof dict;
export const makeAoeShape = (
  type: string,
  targetingType: TargetingType,
  params: AnyObject
): GenericAOEShape => {
  const ctor = dict[type as AOEType]();
  if (!ctor) {
    throw new Error(`Unknown AOE shape type: ${type}`);
  }

  // @ts-expect-error
  return ctor.fromJSON(targetingType, params);
};
