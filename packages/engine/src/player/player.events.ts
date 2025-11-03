import type { DeckCard } from '../card/components/card-manager.component';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Player, SerializedPlayer } from './player.entity';
import type { PLAYER_EVENTS } from './player.enums';

export class PlayerTurnEvent extends TypedSerializableEvent<
  { player: Player },
  { player: SerializedPlayer }
> {
  serialize() {
    return {
      player: this.data.player.serialize()
    };
  }
}

export class PlayerDrawEvent extends TypedSerializableEvent<
  { player: Player; amount: number },
  { player: SerializedPlayer; amount: number }
> {
  serialize() {
    return {
      player: this.data.player.serialize(),
      amount: this.data.amount
    };
  }
}

export class PlayerPlayCardEvent extends TypedSerializableEvent<
  { player: Player; card: DeckCard },
  { player: string; card: string }
> {
  serialize() {
    return {
      player: this.data.player.id,
      card: this.data.card.id
    };
  }
}

export class PlayerManaChangeEvent extends TypedSerializableEvent<
  { player: Player; amount: number },
  { player: string; amount: number }
> {
  serialize() {
    return {
      player: this.data.player.id,
      amount: this.data.amount
    };
  }
}

export class PlayerBeforeReplaceCardEvent extends TypedSerializableEvent<
  { card: DeckCard },
  { card: string }
> {
  serialize() {
    return {
      card: this.data.card.id
    };
  }
}

export class PlayerAfterReplaceCardEvent extends TypedSerializableEvent<
  { card: DeckCard; replacement: DeckCard },
  {
    card: string;
    replacement: string;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      replacement: this.data.replacement.id
    };
  }
}

export class PlayerBeforeEarnVictoryPointsEvent extends TypedSerializableEvent<
  { player: Player; amount: number },
  { player: string; amount: number }
> {
  serialize() {
    return {
      player: this.data.player.id,
      amount: this.data.amount
    };
  }
}

export class PlayerAfterEarnVictoryPointsEvent extends TypedSerializableEvent<
  { player: Player; amount: number },
  { player: string; amount: number }
> {
  serialize() {
    return {
      player: this.data.player.id,
      amount: this.data.amount
    };
  }
}

export type PlayerEventMap = {
  [PLAYER_EVENTS.PLAYER_START_TURN]: PlayerTurnEvent;
  [PLAYER_EVENTS.PLAYER_END_TURN]: PlayerTurnEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_PLAY_CARD]: PlayerPlayCardEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_PLAY_CARD]: PlayerPlayCardEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_REPLACE_CARD]: PlayerBeforeReplaceCardEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_REPLACE_CARD]: PlayerAfterReplaceCardEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_EARN_VICTORY_POINTS]: PlayerBeforeEarnVictoryPointsEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_EARN_VICTORY_POINTS]: PlayerAfterEarnVictoryPointsEvent;
};
