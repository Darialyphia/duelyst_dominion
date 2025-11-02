import type { BoardCell } from '../../board/board-cell.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedUnit } from '../../unit/unit.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { BoardCellViewModel } from './board-cell.model';
import type { PlayerViewModel } from './player.model';

export class UnitViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedUnit,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: UnitViewModel | SerializedUnit) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    Object.assign(this.data, data);
  }

  get id() {
    return this.data.id;
  }

  get position() {
    return this.data.position;
  }

  get x() {
    return this.data.position.x;
  }

  get y() {
    return this.data.position.y;
  }

  canMoveTo(cell: BoardCellViewModel) {
    return this.data.moveZone.includes(cell.id);
  }

  canAttackAt(cell: BoardCellViewModel) {
    return this.data.attackableCells.includes(cell.id);
  }

  isInDangerZone(cell: BoardCellViewModel) {
    return this.data.dangerZone.includes(cell.id);
  }

  getPlayer() {
    const playerId = this.data.player;
    if (!playerId) return null;
    return this.getEntities()[playerId] as PlayerViewModel;
  }
}
