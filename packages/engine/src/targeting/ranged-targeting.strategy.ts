import { Vec2, type Point3D } from '@game/shared';
import type { Game } from '../game/game';
import {
  isValidTargetingType,
  type TargetingStrategy,
  type TargetingType
} from './targeting-strategy';
import type { AnyCard } from '../card/entities/card.entity';

export type RangedTargetingStrategyOptions = {
  minRange: number;
  maxRange: number;
};

export class RangedTargetingStrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private card: AnyCard,
    private origin: Point3D,
    private type: TargetingType,
    public readonly options: RangedTargetingStrategyOptions
  ) {}

  get position() {
    return Vec2.fromPoint(this.origin);
  }

  isWithinRange(point: Point3D) {
    return (
      this.game.boardSystem.getDistance(this.position, point) >= this.options.minRange &&
      this.game.boardSystem.getDistance(this.position, point) <= this.options.maxRange
    );
  }

  canTargetAt(point: Point3D) {
    if (!this.isWithinRange(point)) return false;

    return isValidTargetingType(this.game, point, this.card.player, this.type);
  }
}
