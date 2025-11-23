import type { SerializedCompositeAOE } from '../../../aoe/composite.aoe-shape';
import type { SerializedPointAOE } from '../../../aoe/point.aoe-shape';
import type { SerializedRectangleAOE } from '../../../aoe/rectangle.aoe-shape';
import type { SerializedRingAOE } from '../../../aoe/ring.aoe-shape';

export type SerializedAOE =
  | SerializedPointAOE
  | SerializedRingAOE
  | SerializedCompositeAOE
  | SerializedRectangleAOE;
