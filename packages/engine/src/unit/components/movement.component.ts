import { Vec2, type Point, type Values } from '@game/shared';
import {
  TypedSerializableEvent,
  TypedSerializableEventEmitter
} from '../../utils/typed-emitter';

import type { PathfinderComponent } from '../../pathfinding/pathfinder.component';
import { Position } from '../../utils/position';
import { cellIdToPoint } from '../../board/board-utils';
import type { SerializedCoords } from '../../board/board-cell.entity';
import { Unit } from '../unit.entity';
import { UNIT_EVENTS } from '../unit.enums';
import { UnitAfterMoveEvent, UnitBeforeMoveEvent } from '../unit-events';
import type { Game } from '../../game/game';

export type MovementComponentOptions = {
  position: Point;
  pathfinding: PathfinderComponent;
};

export class MovementComponent {
  position: Position;

  private pathfinding: PathfinderComponent;

  private _movementsCount = 0;

  constructor(
    private game: Game,
    private unit: Unit,
    options: MovementComponentOptions
  ) {
    this.position = Position.fromPoint(options.position);
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

  canMoveTo(point: Point, maxDistance: number) {
    const path = this.pathfinding.getPathTo(this.position, point);
    if (!path) return false;
    return path.distance <= maxDistance;
  }

  getPathTo(point: Point, maxDistance?: number) {
    return this.pathfinding.getPathTo(this, point, maxDistance);
  }

  async move(to: Point) {
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
      this.position = Position.fromPoint(point);
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

    return path;
  }
}
