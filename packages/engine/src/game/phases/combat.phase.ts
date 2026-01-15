import type { Player } from '../../player/player.entity';
import type { Unit } from '../../unit/unit.entity';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { type EmptyObject, type Serializable } from '@game/shared';

export class CombatPhase implements GamePhaseController, Serializable<EmptyObject> {
  currentPlayer: Player;

  private _currentTarget: Unit | Player | null = null;
  private _currentAttacker: Unit | null = null;

  constructor(private game: Game) {
    this.currentPlayer = game.turnSystem.initiativePlayer;
  }

  get currentAttacker(): Unit | null {
    return this._currentAttacker;
  }

  get currentTarget(): Unit | Player | null {
    return this._currentTarget;
  }
  async onEnter() {}

  async performCombat() {
    console.log('combat phase started');
    for (let i = 0; i < this.game.boardSystem.map.rows; i++) {
      await this.handleRowCombat(i);
    }

    await this.game.gamePhaseSystem.endTurn();
  }

  private async handleRowCombat(rowIndex: number) {
    const unitsInRow = this.game.unitSystem.units.filter(
      unit => unit.position.y === rowIndex
    );

    for (const unit of unitsInRow) {
      if (!unit.isAlive) continue;
      if (unit.isExhausted) continue;

      const target = unit.attackTarget;
      if (target) {
        this._currentAttacker = unit;
        this._currentTarget = target;
        await unit.attack(target);
        this._currentAttacker = null;
        this._currentTarget = null;
      }
    }
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
