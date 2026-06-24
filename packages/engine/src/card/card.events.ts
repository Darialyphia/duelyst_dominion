import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { CARD_EVENTS } from './card.enums';
import type { AnyCard, SerializedCard } from './entities/card.entity';

export class CardExhaustEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardWakeUpEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardDiscardEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAddToHandevent extends TypedSerializableEvent<
  { card: AnyCard; index: number | null },
  { card: SerializedCard; index: number | null }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      index: this.data.index
    };
  }
}

export class CardBeforePlayEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAfterPlayEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardBeforePlayWithoutAffinityMatchEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardAfterPlayWithoutAffinityMatchEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class CardEffectTriggeredEvent extends TypedSerializableEvent<
  { card: AnyCard; message: string },
  { card: string; message: string }
> {
  serialize() {
    return {
      card: this.data.card.id,
      message: this.data.message
    };
  }
}

export type CardEventMap = {
  [CARD_EVENTS.CARD_DISCARD]: CardDiscardEvent;
  [CARD_EVENTS.CARD_ADD_TO_HAND]: CardAddToHandevent;
  [CARD_EVENTS.CARD_BEFORE_PLAY]: CardBeforePlayEvent;
  [CARD_EVENTS.CARD_AFTER_PLAY]: CardAfterPlayEvent;
  [CARD_EVENTS.CARD_EFFECT_TRIGGERED]: CardEffectTriggeredEvent;
};
