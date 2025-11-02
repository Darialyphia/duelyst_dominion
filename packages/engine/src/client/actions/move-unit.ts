import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type {
  BoardCellClickRule,
  BoardCellViewModel
} from '../view-models/board-cell.model';
import { GAME_PHASES } from '../../game/game.enums';

export class MoveUnitAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel, state: GameClientState) {
    return (
      this.client.ui.isInteractingPlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      !!this.client.ui.selectedUnit &&
      this.client.ui.selectedUnit.canMoveTo(cell)
    );
  }

  handler(cell: BoardCellViewModel) {
    this.client.networkAdapter.dispatch({
      type: 'move',
      payload: {
        playerId: this.client.playerId,
        unitId: this.client.ui.selectedUnit!.id,
        x: cell.x,
        y: cell.y
      }
    });
  }
}
