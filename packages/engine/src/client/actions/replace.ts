import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import { INTERACTION_STATES, GAME_PHASES } from '../../game/game.enums';
import type { PlayerViewModel } from '../view-models/player.model';

export class ReplaceGlobalAction implements GlobalActionRule {
  readonly variant = 'primary' as const;

  readonly id = 'replace';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'Replace Card';
  }

  shouldDisplay(state: GameClientState): boolean {
    return (
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      this.client.playerId === state.turnPlayer &&
      (state.entities[state.turnPlayer] as PlayerViewModel).canReplace
    );
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    this.client.ui.isReplacingCard = !this.client.ui.isReplacingCard;
  }
}
