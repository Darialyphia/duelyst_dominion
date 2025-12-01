import type { Point, Vec2 } from '@game/shared';
import type { Unit } from '../unit.entity';

export type BehaviorStrategy = {
  findBestTarget(): Unit;
  findBestPositionToAttack(target: Unit): Vec2;
  findBestPathToTarget(point: Point): Vec2[];
};
