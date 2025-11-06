import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type {
  BoardCellClickRule,
  BoardCellViewModel
} from '../view-models/board-cell.model';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { isDefined } from '@game/shared';

export class SelectUnitAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel, state: GameClientState) {
    const unit = cell.getUnit();
    return (
      this.client.ui.isInteractingPlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      isDefined(unit) &&
      this.client.ui.selectedUnit?.id !== unit.id &&
      unit.getPlayer()?.id === this.client.playerId
    );
  }

  handler(cell: BoardCellViewModel) {
    const unit = cell.getUnit();
    if (!unit) return;

    this.client.ui.selectUnit(unit);
  }
}
