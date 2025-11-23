import { Vec2, type Point } from '@game/shared';
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
    private getOrigins: () => Point[],
    private type: TargetingType,
    public readonly options: RangedTargetingStrategyOptions
  ) {}

  isWithinRange(point: Point) {
    return this.getOrigins().some(
      origin =>
        this.game.boardSystem.getDistance(origin, point) >= this.options.minRange &&
        this.game.boardSystem.getDistance(origin, point) <= this.options.maxRange
    );
  }

  canTargetAt(point: Point) {
    if (!this.isWithinRange(point)) return false;

    return isValidTargetingType(this.game, point, this.card.player, this.type);
  }
}
