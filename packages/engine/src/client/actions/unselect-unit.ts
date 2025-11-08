import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { isDefined } from '@game/shared';
import type { BoardCellClickRule } from '../controllers/ui-controller';

export class UnselectUnitAction implements BoardCellClickRule {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel, state: GameClientState) {
    const unit = cell.getUnit();
    return (
      this.client.ui.isInteractivePlayer &&
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      (!isDefined(unit) ||
        unit.getPlayer()?.id !== this.client.playerId ||
        unit.isExhausted)
    );
  }

  handler() {
    this.client.ui.unselectUnit();
  }
}
