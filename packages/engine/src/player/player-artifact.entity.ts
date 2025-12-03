import { nanoid } from 'nanoid';
import type { Serializable } from '@game/shared';
import { EntityWithModifiers } from '../utils/entity-with-modifiers';
import type { Game } from '../game/game';
import type { ArtifactCard } from '../card/entities/artifact-card.entity';
import { Interceptable } from '../utils/interceptable';
import type { UnitReceiveDamageEvent } from '../unit/unit-events';
import { UNIT_EVENTS } from '../unit/unit.enums';
import { ARTIFACT_EVENTS } from './player.enums';
import {
  ArtifactAfterDurabilityChangeEvent,
  ArtifactBeforeDurabilityChangeEvent,
  ArtifactDestroyEvent,
  ArtifactEquipedEvent
} from './player-artifact.events';

export type PlayerArtifactOptions = {
  card: ArtifactCard;
  playerId: string;
};

const makeInterceptors = () => {
  return {
    shouldLoseDurabilityOnGeneralDamage: new Interceptable<boolean>()
  };
};

export type PlayerArtifactInterceptor = ReturnType<typeof makeInterceptors>;

export type SerializedPlayerArtifact = {
  id: string;
  entityType: 'artifact';
  card: string;
  durability: number;
  maxDurability: number;
  modifiers: string[];
};

export class PlayerArtifact
  extends EntityWithModifiers<PlayerArtifactInterceptor>
  implements Serializable<SerializedPlayerArtifact>
{
  readonly card: ArtifactCard;

  private playerId: string;

  durability: number;

  constructor(
    protected game: Game,
    options: PlayerArtifactOptions
  ) {
    super(`${options.playerId}-artifact-${nanoid(6)}`, makeInterceptors());
    this.card = options.card;
    this.durability = this.card.durability;
    this.playerId = options.playerId;
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'artifact' as const,
      card: this.card.id,
      durability: this.durability,
      maxDurability: this.maxDurability,
      modifiers: this.modifiers.list.map(modifier => modifier.id)
    };
  }

  get maxDurability() {
    return this.card.durability;
  }

  get player() {
    return this.game.playerSystem.getPlayerById(this.playerId)!;
  }

  get shouldLoseDurabilityOnGeneralDamage(): boolean {
    return this.interceptors.shouldLoseDurabilityOnGeneralDamage.getValue(true, {});
  }

  private async onGeneralDamageTaken(event: UnitReceiveDamageEvent) {
    if (event.data.unit.id !== this.player.general.id) return;
    if (event.data.damage.getFinalAmount(this.player.general) === 0) return;
    if (this.shouldLoseDurabilityOnGeneralDamage) {
      await this.loseDurability();
    }
  }

  async equip() {
    await this.game.on(
      UNIT_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
      this.onGeneralDamageTaken.bind(this)
    );
    await this.game.emit(ARTIFACT_EVENTS.ARTIFACT_EQUIPED, new ArtifactEquipedEvent({}));
  }

  async destroy() {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_DESTROY,
      new ArtifactDestroyEvent({})
    );

    this.game.off(
      UNIT_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
      this.onGeneralDamageTaken.bind(this)
    );
    await this.player.artifactManager.unequip(this.card);
    this.modifiers.list.forEach(async modifier => {
      await this.modifiers.remove(modifier.id);
    });

    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_DESTROY,
      new ArtifactDestroyEvent({})
    );
  }

  async loseDurability(amount = 1) {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_DURABILITY_CHANGE,
      new ArtifactBeforeDurabilityChangeEvent({})
    );
    const current = this.durability;
    this.durability -= amount;
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_DURABILITY_CHANGE,
      new ArtifactAfterDurabilityChangeEvent({
        oldDurability: current,
        newDurability: this.durability
      })
    );

    if (this.durability <= 0) {
      await this.destroy();
    }
  }

  async gainDurability(amount = 1) {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_DURABILITY_CHANGE,
      new ArtifactBeforeDurabilityChangeEvent({})
    );
    const current = this.durability;
    this.durability = Math.min(this.durability + amount, this.maxDurability);
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_DURABILITY_CHANGE,
      new ArtifactAfterDurabilityChangeEvent({
        oldDurability: current,
        newDurability: this.durability
      })
    );
  }
}
