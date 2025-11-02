import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { IllegalCardPlayedError } from '../input-errors';
import type { GeneralCard } from '../../card/entities/general-card.entity';

const schema = defaultInputSchema.extend({
  abilityId: z.string()
});

export class UseGeneralAbilityInput extends Input<typeof schema> {
  readonly name = 'useGeneralAbility';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    const generalCard = this.player.general.card as GeneralCard;
    assert(
      generalCard.canUseAbility(this.payload.abilityId),
      new IllegalCardPlayedError()
    );

    await generalCard.useAbility(this.payload.abilityId);
  }
}
