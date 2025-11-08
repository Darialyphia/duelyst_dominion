import type { SerializedCell } from '../../board/entities/board-cell.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { ShrineViewModel } from './shrine.model';
import type { UnitViewModel } from './unit.model';

export class BoardCellViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedCell,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: BoardCellViewModel | SerializedCell) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    Object.assign(this.data, data);

    return this;
  }

  clone() {
    return new BoardCellViewModel(this.data, this.getEntities(), this.getClient());
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

  get isEmpty() {
    return !this.data.unit;
  }

  get unit() {
    const unit = this.data.unit;
    if (!unit) return null;
    return this.getEntities()[unit] as UnitViewModel;
  }

  get shrine() {
    const shrine = this.data.shrine;
    if (!shrine) return null;
    return this.getEntities()[shrine] as ShrineViewModel;
  }
}
