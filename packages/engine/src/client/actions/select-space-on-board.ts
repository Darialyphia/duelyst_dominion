import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type {
  BoardCellClickRule,
  BoardCellViewModel
} from '../view-models/board-cell.model';
import { GAME_PHASES } from '../../game/game.enums';

export class SelectSpaceOnBoardAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel, state: GameClientState) {
    return (
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD &&
      state.interaction.ctx.elligibleSpaces.includes(cell.id) &&
      this.client.ui.isInteractingPlayer
    );
  }

  handler(cell: BoardCellViewModel) {
    this.client.networkAdapter.dispatch({
      type: 'selectSpaceOnBoard',
      payload: {
        playerId: this.client.playerId,
        x: cell.x,
        y: cell.y
      }
    });
  }
}
