import type { CardId } from '@game/api';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import type {
  DeckValidator,
  ValidatableCard,
  ValidatableDeck
} from '@game/engine/src/card/validators/deck.validator';
import { nanoid } from 'nanoid';

export type DeckBuilderCardPool = Array<CardBlueprint>;

type DeckBuilderCardMeta = {
  cardId: CardId;
  isFoil: boolean;
};

export type DeckBuilderDeck = ValidatableDeck<DeckBuilderCardMeta>;
export class DeckBuilderViewModel {
  private _deck: DeckBuilderDeck = {
    id: nanoid(4),
    name: 'New Deck',
    cards: [],
    isEqual: (first, second) => first.meta.cardId === second.meta.cardId
  };

  constructor(
    private cardPool: DeckBuilderCardPool,
    private _validator: DeckValidator<DeckBuilderCardMeta>
  ) {
    this.cardPool = cardPool;
  }

  updateCardPool(cardPool: DeckBuilderCardPool) {
    this.cardPool = cardPool;
  }

  hasCard(blueprintId: string) {
    return this._deck.cards.some(card => card.blueprintId === blueprintId);
  }

  addCard(card: { blueprintId: string; meta: DeckBuilderCardMeta }) {
    const blueprint = this.cardPool.find(c => c.id === card.blueprintId);
    if (!blueprint) {
      throw new Error(
        `Card with ID ${card.blueprintId} not found in card pool.`
      );
    }

    const existing = this._deck.cards.find(
      c => c.meta.cardId === card.meta.cardId
    );
    if (existing) {
      existing.copies++;
    } else {
      this._deck.cards.push({
        blueprintId: card.blueprintId,
        copies: 1,
        meta: card.meta
      });
    }
  }

  removeCard(cardId: string) {
    const existing = this._deck.cards.find(card => card.meta.cardId === cardId);
    if (!existing) return;
    existing.copies--;
    if (existing.copies <= 0) {
      this._deck.cards = this._deck.cards.filter(
        card => card.meta.cardId !== cardId
      );
    }
  }

  getCard(blueprintId: string) {
    return this._deck.cards.find(card => card.blueprintId === blueprintId);
  }

  get validator() {
    return this._validator;
  }

  get deck() {
    return this._deck;
  }

  get deckSize() {
    return this._deck.cards.reduce((acc, card) => acc + card.copies, 0);
  }

  get cards() {
    return this._deck.cards
      .map(card => {
        const blueprint = this.cardPool.find(
          c => c.id === card.blueprintId
        )! as CardBlueprint;

        return {
          ...card,
          blueprint,
          copies: card.copies
        };
      })
      .sort((a, b) => {
        // put Generals at the top
        if (
          a.blueprint.kind === CARD_KINDS.GENERAL &&
          b.blueprint.kind !== CARD_KINDS.GENERAL
        ) {
          return -1;
        }
        if (
          a.blueprint.kind !== CARD_KINDS.GENERAL &&
          b.blueprint.kind === CARD_KINDS.GENERAL
        ) {
          return 1;
        }
        if ('manaCost' in a.blueprint && 'manaCost' in b.blueprint) {
          if (a.blueprint.manaCost === b.blueprint.manaCost) {
            return a.blueprint.name.localeCompare(b.blueprint.name);
          }
          return a.blueprint.manaCost - b.blueprint.manaCost;
        }

        return 0;
      });
  }

  getErrors() {
    return this._validator.validate(this._deck);
  }

  loadDeck(deck: ValidatableDeck<DeckBuilderCardMeta>) {
    this._deck = deck;
  }

  canAdd(card: ValidatableCard<DeckBuilderCardMeta>) {
    return this._validator.canAdd(card, this._deck);
  }

  reset() {
    this._deck = {
      id: nanoid(4),
      name: 'New Deck',
      isEqual: (first, second) => first.meta.cardId === second.meta.cardId,
      cards: []
    };
  }
}
