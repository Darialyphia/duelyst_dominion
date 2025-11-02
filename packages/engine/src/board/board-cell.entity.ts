import type { EmptyObject, Point, Serializable } from '@game/shared';
import { Entity } from '../entity';
import type { Game } from '../game/game';
import { Position } from '../utils/position';
import { pointToCellId } from './board-utils';

export type BoardCellInterceptors = EmptyObject;

export type SerializedCoords = `${string}:${string}`;

export type SerializedCell = {
  id: string;
  entityType: 'cell';
  position: Point;
  player: 'p1' | 'p2' | null;
  unit: string | null;
};

export type BoardCellOptions = {
  position: Point;
  player: 'p1' | 'p2' | null;
};

export class BoardCell
  extends Entity<BoardCellInterceptors>
  implements Serializable<SerializedCell>
{
  readonly position: Position;

  readonly player: 'p1' | 'p2' | null;

  constructor(
    private game: Game,
    options: BoardCellOptions
  ) {
    super(pointToCellId(options.position), {});
    this.position = Position.fromPoint(options.position);
    this.player = options.player;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get unit() {
    return this.game.unitSystem.getUnitAt(this);
  }

  get isWalkable() {
    return true;
  }

  isNeighbor(point: Point) {
    return this.position.isNearby(point);
  }

  serialize(): SerializedCell {
    return {
      id: this.id,
      entityType: 'cell',
      position: this.position,
      player: this.player,
      unit: this.unit ? this.unit.id : null
    };
  }
}
