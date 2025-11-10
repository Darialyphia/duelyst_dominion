import { type Point } from '@game/shared';
import type { TargetingStrategy } from './targeting-strategy';
import type { Game } from '../game/game';
import type { MinionCard } from '../card/entities/minion-card.entity';

export class AirdropTargetingtrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private card: MinionCard
  ) {}

  private isPointValid(point: Point) {
    return !!this.game.boardSystem.getCellAt(point)?.isOccupied;
  }

  isWithinRange(point: Point) {
    return this.isPointValid(point);
  }

  canTargetAt(point: Point) {
    return this.isPointValid(point);
  }
}
