import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import {
  IllegalAttackTargetError,
  IllegalCaptureError,
  NotCurrentPlayerError,
  UnitNotOwnedError,
  UnknownShrineError,
  UnknownUnitError
} from '../input-errors';
import { GAME_PHASES } from '../../game/game.enums';

const schema = defaultInputSchema.extend({
  unitId: z.string(),
  shrineId: z.string()
});

export class CaptureShrineInput extends Input<typeof schema> {
  readonly name = 'captureShrine';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  private get unit() {
    return this.game.unitSystem.getUnitById(this.payload.unitId);
  }

  private get shrine() {
    return this.game.boardSystem.shrines.find(
      shrine => shrine.id === this.payload.shrineId
    );
  }
  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());
    assert(isDefined(this.unit), new UnknownUnitError(this.payload.unitId));
    assert(isDefined(this.shrine), new UnknownShrineError(this.payload.shrineId));
    assert(this.unit.canCapture(this.shrine), new IllegalCaptureError());
    assert(
      this.unit.player.equals(this.game.gamePhaseSystem.turnPlayer),
      new UnitNotOwnedError()
    );

    await this.unit.captureShrine(this.shrine);
  }
}
