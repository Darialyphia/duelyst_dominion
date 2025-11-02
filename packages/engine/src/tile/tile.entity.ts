import {
  Vec2,
  type EmptyObject,
  type Nullable,
  type Point,
  type Serializable
} from '@game/shared';
import type { Unit } from '../unit/unit.entity';
import { GAME_EVENTS } from '../game/game.events';
import type { Game } from '../game/game';
import type { TileBlueprint } from './tile-blueprint';
import { Entity } from '../entity';

export type TileOptions = {
  id: string;
  blueprint: TileBlueprint;
  position: Point;
  playerId?: string;
};

export type SerializedTile = {
  id: string;
  entityType: 'tile';
  position: Point;
  playerId?: string;
  cardIconId: string;
};

export class Tile extends Entity<EmptyObject> implements Serializable<SerializedTile> {
  position: Vec2;
  blueprint: TileBlueprint;
  playerId?: string;
  occupant: Nullable<Unit> = null;

  constructor(
    private game: Game,
    options: TileOptions
  ) {
    super(options.id, {});
    this.position = Vec2.fromPoint(options.position);
    this.playerId = options.playerId;
    this.blueprint = options.blueprint;
    this.checkOccupation = this.checkOccupation.bind(this);
    this.game.on(GAME_EVENTS.MINION_AFTER_SUMMON, this.checkOccupation);
    this.game.on(GAME_EVENTS.UNIT_AFTER_DESTROY, this.checkOccupation);
    this.game.on(GAME_EVENTS.UNIT_AFTER_MOVE, this.checkOccupation);
    this.game.on(GAME_EVENTS.UNIT_AFTER_TELEPORT, this.checkOccupation);
    void this.checkOccupation().then(() => {
      this.blueprint.onCreated?.(this.game, this.occupant, this);
    });
  }

  get player() {
    if (!this.playerId) return null;
    return this.game.playerSystem.getPlayerById(this.playerId);
  }

  private async checkOccupation() {
    const previous = this.occupant;

    this.occupant = this.game.unitSystem.getUnitAt(this.position);
    if (!previous && this.occupant) {
      await this.blueprint.onEnter?.(this.game, this.occupant, this);
    } else if (previous && !this.occupant) {
      await this.blueprint.onLeave?.(this.game, previous, this);
    }
  }

  destroy() {
    this.blueprint.onDestroyed?.(this.game, this.occupant, this);
    this.game.off(GAME_EVENTS.MINION_AFTER_SUMMON, this.checkOccupation);
    this.game.off(GAME_EVENTS.UNIT_AFTER_DESTROY, this.checkOccupation);
    this.game.off(GAME_EVENTS.UNIT_AFTER_MOVE, this.checkOccupation);
    this.game.off(GAME_EVENTS.UNIT_AFTER_TELEPORT, this.checkOccupation);
  }

  serialize(): SerializedTile {
    return {
      id: this.id,
      entityType: 'tile',
      position: this.position.serialize(),
      playerId: this.playerId,
      cardIconId: this.blueprint.cardIconId
    };
  }
}
