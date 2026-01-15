import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { IllegalCardPlayedError } from '../input-errors';

const schema = defaultInputSchema;

export class DeployGeneralInput extends Input<typeof schema> {
  readonly name = 'deployGeneral';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    const card = this.player.generalCard;
    assert(card.canPlay(), new IllegalCardPlayedError());
    await this.game.gamePhaseSystem.deployGeneral(this.player);
  }
}
