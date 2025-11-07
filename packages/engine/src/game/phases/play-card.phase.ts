import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { type EmptyObject, type Serializable } from '@game/shared';

export class PlayCardPhase implements GamePhaseController, Serializable<EmptyObject> {
  currentPlayer: Player;

  constructor(private game: Game) {
    this.currentPlayer = game.gamePhaseSystem.turnPlayer;
  }

  async onEnter() {}

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
