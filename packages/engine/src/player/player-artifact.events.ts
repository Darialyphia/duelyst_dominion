import type { EmptyObject } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { ARTIFACT_EVENTS } from './player.enums';

export class ArtifactEquipedEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class ArtifactBeforeDurabilityChangeEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class ArtifactAfterDurabilityChangeEvent extends TypedSerializableEvent<
  { oldDurability: number; newDurability: number },
  { oldDurability: number; newDurability: number }
> {
  serialize() {
    return {
      oldDurability: this.data.oldDurability,
      newDurability: this.data.newDurability
    };
  }
}

export class ArtifactDestroyEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export type ArtifactEventMap = {
  [ARTIFACT_EVENTS.ARTIFACT_EQUIPED]: ArtifactEquipedEvent;
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_DURABILITY_CHANGE]: ArtifactBeforeDurabilityChangeEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_DURABILITY_CHANGE]: ArtifactAfterDurabilityChangeEvent;
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_DESTROY]: ArtifactDestroyEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_DESTROY]: ArtifactDestroyEvent;
};
