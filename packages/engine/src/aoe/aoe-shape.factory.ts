import type { AnyObject } from '@game/shared';
import type { GenericAOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.enums';
import { PointAOEShape } from './point.aoe-shape';

const dict = {
  point: PointAOEShape
} as const;

export type AOEType = keyof typeof dict;
export const makeAoeShape = (
  type: string,
  targetingType: TargetingType,
  params: AnyObject
): GenericAOEShape => {
  const ctor = dict[type as AOEType];
  if (!ctor) {
    throw new Error(`Unknown AOE shape type: ${type}`);
  }

  return ctor.fromJSON({
    // @ts-expect-error
    type,
    // @ts-expect-error
    targetingType,
    // @ts-expect-error
    params
  });
};
