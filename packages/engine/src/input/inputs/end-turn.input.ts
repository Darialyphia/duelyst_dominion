import { assert } from '@game/shared';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { NotCurrentPlayerError } from '../input-errors';

const schema = defaultInputSchema;

export class EndTurnInput extends Input<typeof schema> {
  readonly name = 'endTurn';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());

    await this.game.gamePhaseSystem.endTurn();
  }
}
