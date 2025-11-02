import { type Point } from '@game/shared';
import type { TargetingStrategy } from './targeting-strategy';
import type { Game } from '../game/game';
import type { MinionCard } from '../card/entities/minion-card.entity';

export class MinionSummonTargetingtrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private card: MinionCard
  ) {}

  private isPointValid(point: Point) {
    return (
      this.card.player.units.some(unit => unit.position.isNearby(point)) &&
      !this.game.unitSystem.getUnitAt(point) &&
      !!this.game.boardSystem.getCellAt(point)?.isWalkable
    );
  }

  isWithinRange(point: Point) {
    return this.isPointValid(point);
  }

  canTargetAt(point: Point) {
    return this.isPointValid(point);
  }
}
