import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { INTERACTION_STATES } from '../../game/game.enums';
import type { BoardCellClickRule } from '../controllers/ui-controller';

export class SelectSpaceOnBoardAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel, state: GameClientState) {
    return (
      state.interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD &&
      state.interaction.ctx.elligibleSpaces.includes(cell.id) &&
      this.client.ui.isInteractivePlayer
    );
  }

  handler(cell: BoardCellViewModel, event: MouseEvent) {
    this.client.dispatch({
      type: 'selectSpaceOnBoard',
      payload: {
        playerId: this.client.playerId,
        x: cell.x,
        y: cell.y
      }
    });
  }
}
