import type { Game } from '../game/game';
import type { Unit } from './unit.entity';
import type { BoardCell } from '../board/entities/board-cell.entity';

export class ZoneCalculator {
  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  calculateZones() {
    // Calculate potential moves upfront as this can be an expensive operation
    // These are moves the unit could make provided it was able to move fully
    const potentialMoves = this.unit
      .getPossibleMoves(this.unit.sprintReach * this.unit.maxMovementsPerTurn, true)
      .map(point => this.game.boardSystem.getCellAt(point)!);

    // Moves the unit can actually make
    const possibleSprintMoves = this.unit
      .getPossibleMoves(this.unit.sprintReach)
      .map(point => this.game.boardSystem.getCellAt(point)!);
    const possibleMoves = this.unit
      .getPossibleMoves(this.unit.movementReach)
      .map(point => this.game.boardSystem.getCellAt(point)!);

    return {
      moveZone: possibleMoves.map(cell => cell.id),
      sprintZone: possibleSprintMoves.map(cell => cell.id),
      dangerZone: this.calculateDangerZone(potentialMoves),
      attackableCells: this.getAttackableCells()
    };
  }

  private calculateDangerZone(potentialMoves: BoardCell[]): string[] {
    return this.game.boardSystem.cells
      .filter(cell =>
        potentialMoves
          .filter(move => cell.isNearby(move))
          .some(point => this.unit.isWithinDangerZone(cell.position, point))
      )
      .map(cell => cell.id);
  }

  private getAttackableCells(): string[] {
    return this.game.boardSystem.cells
      .filter(cell => this.unit.canAttackAt(cell.position))
      .map(cell => cell.id);
  }
}
