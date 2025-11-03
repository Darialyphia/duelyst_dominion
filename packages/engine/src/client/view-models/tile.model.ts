import type { SerializedTile } from '../../tile/tile.entity';
import type { GameClient, GameStateEntities } from '../client';

export class TileViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedTile,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: TileViewModel | SerializedTile) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedTile>) {
    Object.assign(this.data, data);

    return this;
  }

  clone() {
    return new TileViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }
}
