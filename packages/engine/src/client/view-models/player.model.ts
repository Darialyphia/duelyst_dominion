import type { GameClient, GameStateEntities } from '../client';

import type { SerializedPlayer } from '../../player/player.entity';
import type { CardViewModel } from './card.model';
import { isDefined } from '@game/shared';

export class PlayerViewModel {
  private getEntities: () => GameStateEntities;
  private getClient: () => GameClient;

  constructor(
    private data: SerializedPlayer,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: PlayerViewModel | SerializedPlayer) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedPlayer>) {
    Object.assign(this.data, data);

    return this;
  }

  clone() {
    return new PlayerViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get currentHp() {
    return this.data.currentHp;
  }

  get maxHp() {
    return this.data.maxHp;
  }

  get mana() {
    return this.data.currentMana;
  }

  get spentMana() {
    return Math.max(0, this.data.maxMana - this.data.currentMana);
  }

  get overspentMana() {
    return Math.max(0, -this.data.currentMana);
  }

  get maxMana() {
    return this.data.maxMana;
  }

  get runes() {
    return this.data.runes;
  }

  get handSize() {
    return this.data.handSize;
  }

  get remainingCardsInDeck() {
    return this.data.remainingCardsInDeck;
  }

  get isPlayer1() {
    return this.data.isPlayer1;
  }

  get isPlayingCard() {
    return isDefined(this.data.currentlyPlayedCard);
  }

  getCurrentlyPlayedCard() {
    if (!this.data.currentlyPlayedCard) return null;

    return this.getEntities()[this.data.currentlyPlayedCard] as CardViewModel;
  }

  get hand() {
    return this.data.hand.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  get canUseResourceAction() {
    return this.data.canUseResourceAction;
  }

  get maxOverspentMana() {
    return this.data.maxOverspentMana;
  }

  getDiscardPile() {
    return this.data.discardPile.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  getOpponent() {
    const entity = Object.values(this.getEntities()).find(
      entity => entity instanceof PlayerViewModel && entity.id !== this.id
    );
    return entity as PlayerViewModel;
  }

  playCard(index: number) {
    const card = this.hand[index];
    if (!card) return;
    if (!card.canPlay) return;

    this.getClient().networkAdapter.dispatch({
      type: 'playCard',
      payload: {
        playerId: this.data.id,
        index: index
      }
    });
  }
}
