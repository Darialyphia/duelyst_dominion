import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import type { AnyCard } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';
import { Player } from '../../player/player.entity';
import { GAME_EVENTS } from '../../game/game.events';
import { PlayerDrawEvent } from '../../player/player.events';
import { MinionCard } from '../entities/minion-card.entity';
import { SpellCard } from '../entities/spell-card.entity';
import { ArtifactCard } from '../entities/artifact-card.entity';

export type CardManagerComponentOptions = {
  mainDeck: string[];
  maxHandSize: number;
  shouldShuffleDeck: boolean;
};

export type DeckCard = MinionCard | SpellCard | ArtifactCard;
export const isDeckCard = (card: AnyCard): card is DeckCard => {
  return (
    card instanceof MinionCard ||
    card instanceof SpellCard ||
    card instanceof ArtifactCard
  );
};
export type CardLocation = 'hand' | 'mainDeck' | 'discardPile' | 'board';

export class CardManagerComponent {
  private game: Game;

  readonly deck: Deck<DeckCard>;

  readonly hand: DeckCard[] = [];

  readonly discardPile = new Set<DeckCard>();

  readonly banishPile = new Set<DeckCard>();

  readonly destinyZone = new Set<DeckCard>();

  constructor(
    game: Game,
    private player: Player,
    private options: CardManagerComponentOptions
  ) {
    this.game = game;
    this.deck = new Deck(this.game, player);

    if (options.shouldShuffleDeck) {
      this.deck.shuffle();
    }
  }

  private async buildCards<T extends AnyCard>(cards: string[]) {
    const result: T[] = [];
    for (const card of cards) {
      result.push(await this.game.cardSystem.addCard<T>(this.player, card));
    }
    return result;
  }

  async init() {
    const mainDeckCards = await this.buildCards<DeckCard>(this.options.mainDeck);

    this.deck.populate(mainDeckCards);
    this.deck.shuffle();
    this.hand.push(...this.deck.draw(this.game.config.INITIAL_HAND_SIZE));
  }

  get isHandFull() {
    return this.hand.length === this.options.maxHandSize;
  }

  get remainingCardsInMainDeck() {
    return this.deck.remaining;
  }

  get mainDeckSize() {
    return this.deck.size;
  }

  findCard<T extends DeckCard>(
    id: string
  ): {
    card: T;
    location: CardLocation;
  } | null {
    const card = this.hand.find(card => card.id === id);
    if (card) return { card: card as T, location: 'hand' };

    const deckCard = this.deck.cards.find(card => card.id === id);
    if (deckCard) return { card: deckCard as T, location: 'mainDeck' };

    const discardPileCard = [...this.discardPile].find(card => card.id === id);
    if (discardPileCard) return { card: discardPileCard as T, location: 'discardPile' };

    const onBoardCard = this.player.minions.find(unit => unit.card.id === id)?.card;
    if (onBoardCard) return { card: onBoardCard as T, location: 'board' };

    return null;
  }

  getCardInHandAt(index: number) {
    return [...this.hand][index];
  }

  async draw(amount: number) {
    if (this.isHandFull) return;

    const amountToDraw = Math.min(
      amount,
      this.deck.remaining,
      this.options.maxHandSize - this.hand.length
    );
    if (amountToDraw <= 0) return;
    await this.game.emit(
      GAME_EVENTS.PLAYER_BEFORE_DRAW,
      new PlayerDrawEvent({
        player: this.player,
        amount: amountToDraw
      })
    );
    const cards = this.deck.draw(amountToDraw);

    for (const card of cards) {
      await card.addToHand();
    }

    await this.game.emit(
      GAME_EVENTS.PLAYER_AFTER_DRAW,
      new PlayerDrawEvent({
        player: this.player,
        amount: amountToDraw
      })
    );
  }

  async drawIntoDestinyZone(amount: number) {
    const cards = this.deck.draw(amount);

    cards.forEach(card => {
      this.sendToDestinyZone(card);
    });
  }

  removeFromHand(card: AnyCard) {
    const index = this.hand.findIndex(handCard => handCard.equals(card));
    if (index === -1) return;
    this.hand.splice(index, 1);
  }

  discard(card: DeckCard) {
    this.removeFromHand(card);
    this.sendToDiscardPile(card);
  }

  sendToDiscardPile(card: DeckCard) {
    this.discardPile.add(card as DeckCard);
  }

  removeFromDiscardPile(card: DeckCard) {
    this.discardPile.delete(card);
  }

  sendToBanishPile(card: DeckCard) {
    this.banishPile.add(card);
  }

  removeFromBanishPile(card: DeckCard) {
    this.banishPile.delete(card);
  }

  sendToDestinyZone(card: DeckCard) {
    this.destinyZone.add(card);
  }

  removeFromDestinyZone(card: DeckCard) {
    this.destinyZone.delete(card);
  }

  replaceCardAt(index: number, random = true) {
    const card = this.getCardInHandAt(index);
    if (!card) return card;

    const replacement = random ? this.deck.randomReplace(card) : this.deck.replace(card);
    this.hand[index] = replacement;

    return replacement;
  }

  async addToHand(card: DeckCard, index?: number) {
    if (this.isHandFull) return;
    if (isDefined(index)) {
      this.hand.splice(index, 0, card);
      return;
    }
    this.hand.push(card);
  }
}
