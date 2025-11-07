import type { Point, Serializable } from '@game/shared';
import { Entity, type EmptyInterceptables } from '../../entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { UnitAfterMoveEvent } from '../../unit/unit-events';

export type SerializedTeleporter = {
  id: string;
  entityType: 'teleporter';
  gates: [Point, Point];
  color: string;
};

export class Teleporter
  extends Entity<EmptyInterceptables>
  implements Serializable<SerializedTeleporter>
{
  readonly gates: [Point, Point];

  constructor(
    private game: Game,
    id: string,
    gates: [Point, Point],
    private readonly color: string
  ) {
    super(`teleporter_${id}`, {});
    this.gates = gates;
    game.on(GAME_EVENTS.UNIT_AFTER_MOVE, this.onUnitMove.bind(this));
  }

  serialize(): SerializedTeleporter {
    return {
      id: this.id,
      entityType: 'teleporter',
      gates: this.gates,
      color: this.color
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
