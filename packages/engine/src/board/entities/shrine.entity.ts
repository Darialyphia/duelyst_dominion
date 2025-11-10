import { isDefined, Vec2, type Serializable, type Values } from '@game/shared';
import { Entity, type EmptyInterceptables } from '../../entity';
import type { Game } from '../../game/game';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { Player } from '../../player/player.entity';
import type { PlayerTurnEvent } from '../../player/player.events';
import type { Unit } from '../../unit/unit.entity';
import { PLAYER_EVENTS } from '../../player/player.enums';

export const SHRINE_EVENTS = {
  SHRINE_BEFORE_CAPTURE: 'shrine:before-capture',
  SHRINE_AFTER_CAPTURE: 'shrine:after-capture',
  SHRINE_BEFORE_HOLD: 'shrine:before-hold',
  SHRINE_AFTER_HOLD: 'shrine:after-hold'
} as const;
export type ShrineEvent = Values<typeof SHRINE_EVENTS>;

export type SerializedShrine = {
  id: string;
  entityType: 'shrine';
  position: { x: number; y: number };
  player: string | null;
  attackCmdByPlayer: Record<string, number>;
  defendCmdByPlayer: Record<string, number>;
  capturableByPlayer: Record<string, boolean>;
  capturableByUnit: Record<string, boolean>;
};

export class Shrine
  extends Entity<EmptyInterceptables>
  implements Serializable<SerializedShrine>
{
  player: Player | null = null;

  readonly position: Vec2;

  constructor(
    private game: Game,
    position: Vec2
  ) {
    super(`shrine_${position.x}_${position.y}`, {});
    this.position = position;
    game.on(PLAYER_EVENTS.PLAYER_START_TURN, this.onTurnStart.bind(this));
    game.on(PLAYER_EVENTS.PLAYER_END_TURN, this.onTurnEnd.bind(this));
  }

  serialize(): SerializedShrine {
    return {
      id: this.id,
      entityType: 'shrine',
      position: { x: this.position.x, y: this.position.y },
      player: this.player?.id ?? null,
      attackCmdByPlayer: this.attackingCmdByPlayer,
      defendCmdByPlayer: this.defendingCmdByPlayer,
      capturableByPlayer: Object.fromEntries(
        this.game.playerSystem.players.map(player => [
          player.id,
          player.units.some(unit => this.canBeCapturedBy(unit))
        ])
      ),
      capturableByUnit: Object.fromEntries(
        this.neighborUnits.map(unit => [unit.id, unit.canCapture(this)])
      )
    };
  }

  async capture(unit: Unit) {
    await this.game.emit(
      SHRINE_EVENTS.SHRINE_BEFORE_CAPTURE,
      new ShrineCaptureEvent({ shrine: this, unit })
    );

    this.player = unit.player;

    const victoryPointsNeededToWin =
      this.game.config.VICTORY_POINT_GOAL - this.player.victoryPoints;
    const shouldEarnVP =
      victoryPointsNeededToWin > 1 ||
      this.game.boardSystem.shrines.every(shrine => shrine.player?.equals(this.player!));

    if (shouldEarnVP) {
      await unit.player.earnVictoryPoints(
        this.game.config.SHRINE_CAPTURE_VICTORY_POINT_REWARD
      );
    }

    await this.game.emit(
      SHRINE_EVENTS.SHRINE_AFTER_CAPTURE,
      new ShrineCaptureEvent({ shrine: this, unit })
    );
  }

  get neighborUnits(): Unit[] {
    return this.game.boardSystem
      .getNeighbors(this.position)
      .map(cell => cell.unit)
      .filter(isDefined);
  }

  get attackingCmdByPlayer() {
    return Object.fromEntries(
      this.game.playerSystem.players.map(player => {
        const cmdTotal = this.neighborUnits.reduce((total, neighborUnit) => {
          if (!neighborUnit.isAlly(player)) return total;
          if (neighborUnit.isExhausted) return total;
          return total + neighborUnit.cmd;
        }, 0);
        return [player.id, cmdTotal];
      })
    );
  }

  get defendingCmdByPlayer() {
    return Object.fromEntries(
      this.game.playerSystem.players.map(player => {
        const cmdTotal = this.neighborUnits.reduce((total, neighborUnit) => {
          if (!neighborUnit.isAlly(player)) return total;
          return total + neighborUnit.cmd;
        }, 0);
        return [player.id, cmdTotal];
      })
    );
  }

  canBeCapturedBy(unit: Unit) {
    if (this.player?.equals(unit.player)) return false;

    const isNearby = this.neighborUnits.some(neighborUnit => neighborUnit.equals(unit));
    if (!isNearby) return false;

    const cmdTotal = this.neighborUnits.reduce((total, neighborUnit) => {
      if (!neighborUnit.isAlly(unit)) return total;
      if (neighborUnit.isExhausted) return total;
      return total + neighborUnit.cmd;
    }, 0);

    const enemyCmdTotal = this.neighborUnits.reduce((total, neighborUnit) => {
      if (!neighborUnit.isEnemy(unit)) return total;
      return total + neighborUnit.cmd;
    }, 0);

    return cmdTotal > enemyCmdTotal;
  }

  private async onTurnStart(event: PlayerTurnEvent) {
    if (!this.player) return;
    if (!event.data.player.equals(this.player)) return;

    await this.game.emit(
      SHRINE_EVENTS.SHRINE_BEFORE_HOLD,
      new ShrineHoldEvent({ shrine: this, player: this.player })
    );

    await this.player.earnVictoryPoints(
      this.game.config.SHRINE_HOLDING_VICTORY_POINT_REWARD_PER_TURN
    );

    await this.game.emit(
      SHRINE_EVENTS.SHRINE_AFTER_HOLD,
      new ShrineHoldEvent({ shrine: this, player: this.player })
    );
  }

  private async onTurnEnd() {
    if (!this.player) return;

    const defendingCmd = this.defendingCmdByPlayer[this.player.id];
    if (defendingCmd === 0) {
      this.player = null;
    }
  }
}

export class ShrineCaptureEvent extends TypedSerializableEvent<
  { shrine: Shrine; unit: Unit },
  { shrine: string; unit: string }
> {
  serialize() {
    return {
      shrine: this.data.shrine.id,
      unit: this.data.unit.id
    };
  }
}

export class ShrineHoldEvent extends TypedSerializableEvent<
  { shrine: Shrine; player: Player },
  { shrine: string; player: string }
> {
  serialize() {
    return {
      shrine: this.data.shrine.id,
      player: this.data.player.id
    };
  }
}

export type ShrineEventMap = {
  [SHRINE_EVENTS.SHRINE_BEFORE_CAPTURE]: ShrineCaptureEvent;
  [SHRINE_EVENTS.SHRINE_AFTER_CAPTURE]: ShrineCaptureEvent;
  [SHRINE_EVENTS.SHRINE_BEFORE_HOLD]: ShrineHoldEvent;
  [SHRINE_EVENTS.SHRINE_AFTER_HOLD]: ShrineHoldEvent;
};
