import { Vec2, type EmptyObject, type Point, type Serializable } from '@game/shared';
import { Entity } from '../../entity';
import type { Game } from '../../game/game';
import { pointToCellId } from '../board-utils';
import type { BoardHex } from '../board.system';
import { EntityWithModifiers } from '../../utils/entity-with-modifiers';
import { Interceptable } from '../../utils/interceptable';

export type BoardCellInterceptors = {
  isWalkable: Interceptable<boolean>;
};

export type SerializedCoords = `${string}:${string}`;

export type SerializedCell = {
  id: string;
  entityType: 'cell';
  position: Point;
  player: 'p1' | 'p2' | null;
  unit: string | null;
  shrine: string | null;
};

export type BoardCellOptions = {
  position: Point;
  player: 'p1' | 'p2' | null;
  hex: InstanceType<typeof BoardHex>;
};

export class BoardCell
  extends EntityWithModifiers<BoardCellInterceptors>
  implements Serializable<SerializedCell>
{
  readonly position: Vec2;

  readonly player: 'p1' | 'p2' | null;

  constructor(
    private game: Game,
    options: BoardCellOptions
  ) {
    super(pointToCellId(options.position), {
      isWalkable: new Interceptable()
    });
    this.position = Vec2.fromPoint(options.position);
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

  get shrine() {
    return this.game.boardSystem.shrines.find(shrine =>
      shrine.position.equals(this.position)
    );
  }

  get isOccupied() {
    return !this.unit && !this.shrine;
  }

  isNeighbor(point: Point) {
    return this.game.boardSystem.getDistance(this.position, point) === 1;
  }

  serialize(): SerializedCell {
    return {
      id: this.id,
      entityType: 'cell',
      position: this.position,
      player: this.player,
      unit: this.unit ? this.unit.id : null,
      shrine: this.shrine ? this.shrine.id : null
    };
  }
}
