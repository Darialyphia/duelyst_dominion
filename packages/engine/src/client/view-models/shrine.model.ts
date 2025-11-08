import type { SerializedShrine } from '../../board/entities/shrine.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { PlayerViewModel } from './player.model';

export class ShrineViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedShrine,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: ShrineViewModel | SerializedShrine) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    Object.assign(this.data, data);

    return this;
  }

  clone() {
    return new ShrineViewModel(this.data, this.getEntities(), this.getClient());
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

  get attackCmdByPlayer() {
    return this.data.attackCmdByPlayer;
  }

  get defendCmdByPlayer() {
    return this.data.defendCmdByPlayer;
  }

  get capturableByPlayer() {
    return this.data.capturableByPlayer;
  }

  get player() {
    if (!this.data.player) return null;
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }
}
