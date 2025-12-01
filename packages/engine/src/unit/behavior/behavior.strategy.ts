import type { Nullable, Vec2 } from '@game/shared';
import type { Unit } from '../unit.entity';

export type BehaviorStrategy = {
  findBestTarget(): Unit;
  findBestPositionToAttack(target: Unit): Nullable<Vec2>;
  findBestPathToTarget(target: Unit): Nullable<Vec2[]>;
};
