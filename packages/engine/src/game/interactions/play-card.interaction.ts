import { assert } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import {
  InvalidPlayerError,
  INTERACTION_STATE_TRANSITIONS
} from '../systems/game-interaction.system';
import type { DeckCard } from '../../card/components/card-manager.component';
type PlayCardContextOptions = {
  card: DeckCard;
  player: Player;
};

export class PlayCardContext {
  static async create(
    game: Game,
    options: PlayCardContextOptions
  ): Promise<PlayCardContext> {
    const instance = new PlayCardContext(game, options);
    await instance.init();
    return instance;
  }

  private card: DeckCard;

  readonly player: Player;

  private constructor(
    private game: Game,
    options: PlayCardContextOptions
  ) {
    this.player = options.player;
    this.card = options.card;
  }

  async init() {
    await this.game.inputSystem.askForPlayerInput();
    await this.player.playCardFromHand(this.card);
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_PLAYING_CARD);
    this.game.interaction.onInteractionEnd();
  }

  serialize() {
    return {
      card: this.card.id,
      player: this.player.id
    };
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.CANCEL_PLAYING_CARD);
    this.game.interaction.onInteractionEnd();
  }
}
