import type { SerializedShrine } from '../../board/entities/shrine.entity';
import type { SerializedTeleporter } from '../../board/entities/two-way-teleporter';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';

export class TeleporterViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedTeleporter,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: TeleporterViewModel | SerializedTeleporter) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    Object.assign(this.data, data);

    return this;
  }

  clone() {
    return new TeleporterViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get gates() {
    return this.data.gates;
  }

  get color() {
    return this.data.color;
  }

  get imagePath() {
    return `/assets/ui/teleporter-${this.color}.png`;
  }
}
