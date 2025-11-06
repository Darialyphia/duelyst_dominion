import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type InteractionStateDict } from '../../game/game.enums';

const schema = defaultInputSchema;

export class CancelPlayCardInput extends Input<typeof schema> {
  readonly name = 'cancelPlayCard';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['PLAYING_CARD']>();

    await interactionContext.ctx.cancel(this.player);
  }
}
