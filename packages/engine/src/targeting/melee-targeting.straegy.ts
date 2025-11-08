import { type Point3D } from '@game/shared';
import {
  isValidTargetingType,
  type TargetingStrategy,
  type TargetingType
} from './targeting-strategy';
import type { Game } from '../game/game';
import type { Unit } from '../unit/unit.entity';

export class MeleeTargetingStrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private unit: Unit,
    private type: TargetingType,
    private allowCenter = true
  ) {}

  isWithinRange(point: Point3D) {
    if (!this.allowCenter && this.unit.position.equals(point)) return false;
    if (this.game.boardSystem.getDistance(this.unit.position, point) > 1) return false;

    return true;
  }

  canTargetAt(point: Point3D) {
    if (!this.isWithinRange(point)) return false;
    const unit = this.game.unitSystem.getUnitAt(point);
    if (!unit) return false;

    return isValidTargetingType(this.game, point, this.unit.player, this.type);
  }
}
