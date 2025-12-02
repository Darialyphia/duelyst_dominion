import type { DeckCard } from '../../card/components/card-manager.component';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { InvalidPlayerError } from '../game-error';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import type { GamePhaseController } from './game-phase';
import { assert, type Serializable } from '@game/shared';

export class PlayCardPhase
  implements GamePhaseController, Serializable<{ card: string }>
{
  currentPlayer: Player;

  card!: DeckCard;

  constructor(private game: Game) {
    this.currentPlayer = game.gamePhaseSystem.turnPlayer;
  }

  async onEnter() {}

  async onExit() {}

  async play(card: DeckCard) {
    this.card = card;
    const result = await this.currentPlayer.playCardFromHand(this.card);
    if (!result.cancelled) {
      await this.game.gamePhaseSystem.sendTransition(
        GAME_PHASE_TRANSITIONS.COMMIT_PLAYING_CARD
      );
    }
  }

  async cancel(player: Player) {
    assert(player.equals(this.currentPlayer), new InvalidPlayerError());
    await this.card.cancelPlay?.();
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.CANCEL_PLAYING_CARD
    );
  }

  serialize(): { card: string } {
    return {
      card: this.card.id
    };
  }
}
