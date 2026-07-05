import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import { INTERACTION_STATES, GAME_PHASES } from '../../game/game.enums';
import type { Rune } from '../../player/player.enums';
import type { PlayerViewModel } from '../view-models/player.model';

export class GainRuneGlobalAction implements GlobalActionRule {
  readonly variant = 'error' as const;

  readonly id = 'gain_rune';

  constructor(
    private client: GameClient,
    private rune: Rune
  ) {}

  getLabel(): string {
    return `Gain <rt-runes runes="${this.rune}" />`;
  }

  private get player() {
    return this.client.state.entities[this.client.playerId] as PlayerViewModel;
  }

  shouldDisplay(state: GameClientState): boolean {
    return (
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      this.client.playerId === state.turnPlayer &&
      this.player.canTakeResourceAction
    );
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    this.client.takeResourceAction({
      type: 'rune',
      rune: this.rune
    });
  }
}
