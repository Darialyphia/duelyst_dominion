import type { EmptyObject, Prettify, Values } from '@game/shared';
import type { Input } from '../input/input';
import { InputError } from '../input/input-errors';
import type { SerializedInput } from '../input/input-system';
import { StarEvent, TypedSerializableEvent } from '../utils/typed-emitter';
import type { SerializedGame } from './game';
import { GAME_PHASE_EVENTS } from './game.enums';
import type { GamePhaseEventMap } from './systems/game-phase.system';
import {
  MODIFIER_EVENTS,
  type Modifier,
  type ModifierEventMap,
  type SerializedModifier
} from '../modifier/modifier.entity';
import { CARD_EVENTS } from '../card/card.enums';
import type { CardEventMap } from '../card/card.events';
import { ARTIFACT_EVENTS, PLAYER_EVENTS } from '../player/player.enums';
import type { PlayerEventMap } from '../player/player.events';
import type { UnitEventMap } from '../unit/unit-events';
import { UNIT_EVENTS } from '../unit/unit.enums';
import type { ArtifactEventMap } from '../player/player-artifact.events';
import { FX_EVENTS, type FxEventMap } from './systems/fx.system';
import { GENERAL_EVENTS, type GeneralEventMap } from '../card/events/general.events';
import { SHRINE_EVENTS, type ShrineEventMap } from '../board/entities/shrine.entity';
import { MINION_EVENTS, type MinionEventMap } from '../card/events/minion.events';

export class GameInputEvent extends TypedSerializableEvent<
  { input: Input<any> },
  SerializedInput
> {
  serialize() {
    return this.data.input.serialize() as SerializedInput;
  }
}

export class GameInputRequiredEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class GameInputQueueFlushedEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class GameErrorEvent extends TypedSerializableEvent<
  { error: Error; debugDump: SerializedGame },
  { error: string; isFatal: boolean; debugDump: SerializedGame }
> {
  serialize() {
    return {
      error: this.data.error.message,
      isFatal: !(this.data.error instanceof InputError),
      debugDump: this.data.debugDump
    };
  }
}

export class GameReadyEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class GameNewSnapshotEvent extends TypedSerializableEvent<
  { id: number },
  { id: number }
> {
  serialize() {
    return {
      id: this.data.id
    };
  }
}

export class GameModifierEvent extends TypedSerializableEvent<
  {
    modifier: Modifier<any>;
    eventName: string;
    event: { serialize: () => any };
  },
  { modifier: SerializedModifier; eventName: string; event: any }
> {
  serialize() {
    return {
      modifier: this.data.modifier.serialize(),
      eventName: this.data.eventName,
      event: this.data.event.serialize()
    };
  }
}

export type SerializedStarEvent = Values<{
  [Name in Exclude<GameEventName, '*'>]: {
    eventName: Name;
    event: ReturnType<GameEventMap[Name]['serialize']>;
  };
}>;

type GameEventsBase = {
  'game.input-start': GameInputEvent;
  'game.input-end': GameInputEvent;
  'game.input-queue-flushed': GameInputQueueFlushedEvent;
  'game.input-required': GameInputRequiredEvent;
  'game.error': GameErrorEvent;
  'game.ready': GameReadyEvent;
  'game.modifier-event': GameModifierEvent;
  'game.new-snapshot': GameNewSnapshotEvent;
};

export type GameEventMap = Prettify<
  GameEventsBase &
    GamePhaseEventMap &
    ModifierEventMap &
    CardEventMap &
    PlayerEventMap &
    UnitEventMap &
    ArtifactEventMap &
    MinionEventMap &
    GeneralEventMap &
    FxEventMap &
    ShrineEventMap
>;
export type GameEventName = keyof GameEventMap;
export type GameEvent = Values<GameEventMap>;

export type GameStarEvent = StarEvent<GameEventMap>;
export const GAME_EVENTS = {
  ERROR: 'game.error',
  READY: 'game.ready',
  FLUSHED: 'game.input-queue-flushed',
  INPUT_START: 'game.input-start',
  INPUT_END: 'game.input-end',
  INPUT_REQUIRED: 'game.input-required',
  NEW_SNAPSHOT: 'game.new-snapshot',
  ...GAME_PHASE_EVENTS,
  ...MODIFIER_EVENTS,
  ...CARD_EVENTS,
  ...PLAYER_EVENTS,
  ...UNIT_EVENTS,
  ...ARTIFACT_EVENTS,
  ...MINION_EVENTS,
  ...GENERAL_EVENTS,
  ...FX_EVENTS,
  ...SHRINE_EVENTS
} as const satisfies Record<string, keyof GameEventMap>;

export type SerializedEvent<T extends keyof typeof GAME_EVENTS> = ReturnType<
  GameEventMap[(typeof GAME_EVENTS)[T]]['serialize']
>;
