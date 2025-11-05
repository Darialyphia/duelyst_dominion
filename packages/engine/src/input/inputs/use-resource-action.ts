import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert } from '@game/shared';
import { NotCurrentPlayerError, CannotUseResourceActionError } from '../input-errors';
import { GAME_PHASES } from '../../game/game.enums';
import { RUNES } from '../../card/card.enums';

const schema = defaultInputSchema
  .extend({
    type: z.literal('gain-rune'),
    rune: z.enum([RUNES.BLUE, RUNES.RED, RUNES.YELLOW])
  })
  .or(
    defaultInputSchema.extend({
      type: z.literal('draw-card')
    })
  );

export class UseResourceActionInput extends Input<typeof schema> {
  readonly name = 'useResourceAction';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());
    assert(this.player.canPerformResourceAction, new CannotUseResourceActionError());

    await this.player.performResourceAction(this.payload);
  }
}
