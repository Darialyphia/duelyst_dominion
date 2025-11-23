import { Vec2, type Point, type Serializable } from '@game/shared';
import type { Game } from '../../game/game';
import { pointToCellId } from '../board-utils';
import { EntityWithModifiers } from '../../utils/entity-with-modifiers';
import { Interceptable } from '../../utils/interceptable';
import type { Unit } from '../../unit/unit.entity';

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
};

export class BoardCell
  extends EntityWithModifiers<BoardCellInterceptors>
  implements Serializable<SerializedCell>
{
  readonly position: Vec2;

  private readonly _player: 'p1' | 'p2' | null;

  constructor(
    private game: Game,
    options: BoardCellOptions
  ) {
    super(pointToCellId(options.position), {
      isWalkable: new Interceptable()
    });
    this.position = Vec2.fromPoint(options.position);
    this._player = options.player;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get player() {
    if (this._player === 'p1') {
      return this.game.playerSystem.player1;
    } else if (this._player === 'p2') {
      return this.game.playerSystem.player2;
    } else {
      return null;
    }
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

  isNearby(point: Point) {
    return this.game.boardSystem.getDistance(this.position, point) === 1;
  }

  isInFront(unit: Unit) {
    return unit.inFront?.equals(this);
  }

  isBehind(unit: Unit) {
    return unit.behind?.equals(this);
  }

  isAbove(unit: Unit) {
    return unit.above?.equals(this);
  }

  isBelow(unit: Unit) {
    return unit.below?.equals(this);
  }

  serialize(): SerializedCell {
    return {
      id: this.id,
      entityType: 'cell',
      position: this.position,
      player: this._player,
      unit: this.unit ? this.unit.id : null,
      shrine: this.shrine ? this.shrine.id : null
    };
  }
}
