import { Vec2, type Point } from '@game/shared';
import type { PathfinderComponent } from '../../pathfinding/pathfinder.component';
import { cellIdToPoint } from '../../board/board-utils';
import type { SerializedCoords } from '../../board/entities/board-cell.entity';
import { Unit } from '../unit.entity';
import { UNIT_EVENTS } from '../unit.enums';
import { UnitAfterMoveEvent, UnitBeforeMoveEvent } from '../unit-events';
import type { Game } from '../../game/game';

export type MovementComponentOptions = {
  position: Point;
  pathfinding: PathfinderComponent;
};

export class MovementComponent {
  position: Vec2;

  private pathfinding: PathfinderComponent;

  private _movementsCount = 0;

  constructor(
    private game: Game,
    private unit: Unit,
    options: MovementComponentOptions
  ) {
    this.position = Vec2.fromPoint(options.position);
    this.pathfinding = options.pathfinding;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get movementsCount() {
    return this._movementsCount;
  }

  isAt(point: Point) {
    return this.position.equals(point);
  }

  resetMovementsCount() {
    this._movementsCount = 0;
  }

  setMovementCount(count: number) {
    this._movementsCount = count;
  }

  getAllPossibleMoves(maxDistance: number) {
    const distanceMap = this.pathfinding.getDistanceMap(this.position, maxDistance);
    return Object.entries(distanceMap.costs)
      .filter(([, cost]) => cost <= maxDistance)
      .map(([cellId]) => cellIdToPoint(cellId as SerializedCoords));
  }

  canMoveTo(point: Point) {
    if (!this.unit.canMove) return false;

    const path = this.pathfinding.getPathTo(this.position, point);
    if (!path) return false;
    return path.distance <= this.unit.sprintReach;
  }

  getPathTo(point: Point, maxDistance?: number) {
    return this.pathfinding.getPathTo(this, point, maxDistance);
  }

  async move(to: Point) {
    const distance = this.game.boardSystem.getDistance(this.position, to);

    const path = this.pathfinding.getPathTo(this, to);
    if (!path) return;

    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_MOVE,
      new UnitBeforeMoveEvent({
        unit: this.unit,
        position: this.position,
        path: path.path.map(Vec2.fromPoint)
      })
    );
    const currentPosition = this.position;

    for (const point of path.path) {
      this.position = Vec2.fromPoint(point);
    }

    this._movementsCount++;

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_MOVE,
      new UnitAfterMoveEvent({
        unit: this.unit,
        position: this.position,
        previousPosition: currentPosition,
        path: path.path.map(Vec2.fromPoint)
      })
    );

    if (
      distance > this.unit.movementReach &&
      this.unit.movementsMadeThisTurn >= this.unit.maxMovementsPerTurn
    ) {
      this.unit.exhaust();
    }
  }

  async teleport(to: Point) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_TELEPORT,
      new UnitBeforeMoveEvent({
        unit: this.unit,
        position: this.position,
        path: [this.position, Vec2.fromPoint(to)]
      })
    );
    const prevPosition = this.position.clone();
    this.position.x = to.x;
    this.position.y = to.y;
    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_TELEPORT,
      new UnitAfterMoveEvent({
        unit: this.unit,
        position: this.position,
        previousPosition: prevPosition,
        path: [this.position, Vec2.fromPoint(to)]
      })
    );
  }

  getPossibleMoves(max?: number, force = false) {
    if (!this.unit.canMove && !force) return [];

    return this.getAllPossibleMoves(max ?? this.unit.sprintReach).filter(point => {
      const cell = this.game.boardSystem.getCellAt(point)!;
      return !cell.isOccupied;
    });
  }
}
