import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import { INTERACTION_STATES, GAME_PHASES } from '../../game/game.enums';
import type { Rune } from '../../player/player.enums';
import type { PlayerViewModel } from '../view-models/player.model';

export class DrawGlobalAction implements GlobalActionRule {
  readonly variant = 'error' as const;

  readonly id = 'draw';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return `Draw a card`;
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
      type: 'draw'
    });
  }
}
