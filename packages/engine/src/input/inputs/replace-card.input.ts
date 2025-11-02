import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert } from '@game/shared';
import { NotCurrentPlayerError, TooManyReplacesError } from '../input-errors';
import { GAME_PHASES } from '../../game/game.enums';

const schema = defaultInputSchema.extend({
  index: z.number()
});

export class ReplaceCardInput extends Input<typeof schema> {
  readonly name = 'replaceCard';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());

    assert(this.player.canReplaceCard, new TooManyReplacesError());

    await this.player.replaceCard(this.payload.index);
  }
}
