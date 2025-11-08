import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import type { BoardCellClickRule } from '../controllers/ui-controller';
import { isDefined } from '@game/shared';

export class CaptureShrineAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel, state: GameClientState) {
    return (
      cell.shrine !== null &&
      isDefined(this.client.ui.selectedUnit) &&
      cell.shrine.capturableByUnit[this.client.ui.selectedUnit.id] &&
      this.client.ui.isInteractivePlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE
    );
  }

  handler(cell: BoardCellViewModel) {
    this.client.networkAdapter.dispatch({
      type: 'captureShrine',
      payload: {
        playerId: this.client.playerId,
        unitId: this.client.ui.selectedUnit!.id,
        shrineId: cell.shrine!.id
      }
    });
  }
}
