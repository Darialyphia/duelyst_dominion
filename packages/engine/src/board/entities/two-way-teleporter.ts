import type { Point, Serializable, Values } from '@game/shared';
import { Entity, type EmptyInterceptables } from '../../entity';
import type { Game } from '../../game/game';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { Player } from '../../player/player.entity';
import type { Position } from '../../utils/position';
import { GAME_EVENTS } from '../../game/game.events';
import type { PlayerTurnEvent } from '../../player/player.events';
import type { Unit } from '../../unit/unit.entity';
import type { UnitAfterMoveEvent } from '../../unit/unit-events';

export type SerializedTeleporter = {
  id: string;
  entityType: 'teleporter';
  gates: [Point, Point];
};

export class Teleporter
  extends Entity<EmptyInterceptables>
  implements Serializable<SerializedTeleporter>
{
  readonly gates: [Point, Point];

  constructor(
    private game: Game,
    id: string,
    gates: [Point, Point]
  ) {
    super(`teleporter_${id}`, {});
    this.gates = gates;
    game.on(GAME_EVENTS.UNIT_AFTER_MOVE, this.onUnitMove.bind(this));
  }

  serialize(): SerializedTeleporter {
    return {
      id: this.id,
      entityType: 'teleporter',
      gates: this.gates
    };
  }

  private async onUnitMove(event: UnitAfterMoveEvent) {
    const { unit, position } = event.data;

    const gateIndex = this.gates.findIndex(
      gate => gate.x === position.x && gate.y === position.y
    );
    if (gateIndex === -1) return;

    const targetGate = this.gates[gateIndex === 0 ? 1 : 0];

    const isTargetOccupied = this.game.unitSystem.getUnitAt(targetGate);
    if (isTargetOccupied) return;

    await unit.teleport(targetGate);
  }
}
