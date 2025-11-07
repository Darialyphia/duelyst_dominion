import { defaultConfig } from '../../config';
import type { CardBlueprint } from '../card-blueprint';
import { CARD_KINDS } from '../card.enums';

export type DeckViolation = {
  type: string;
  reason: string;
};

export type ValidatableCard<TMeta> = {
  blueprintId: string;
  copies: number;
  meta: TMeta;
};
export type ValidatableDeck<TMeta> = {
  id: string;
  name: string;
  isEqual(first: ValidatableCard<TMeta>, second: ValidatableCard<TMeta>): boolean;
  cards: Array<ValidatableCard<TMeta>>;
};

export type DeckValidationResult =
  | {
      result: 'success';
    }
  | { result: 'failure'; violations: Array<DeckViolation> };

export type DeckValidator<TMeta> = {
  maxCardCopies: number;
  size: number;
  validate(deck: ValidatableDeck<TMeta>): DeckValidationResult;
  canAdd(card: ValidatableCard<TMeta>, deck: ValidatableDeck<TMeta>): boolean;
};

export class StandardDeckValidator<TMeta> implements DeckValidator<TMeta> {
  constructor(private cardPool: Record<string, CardBlueprint>) {}

  get size(): number {
    return defaultConfig.MAX_MAIN_DECK_SIZE;
  }

  get maxCardCopies(): number {
    return defaultConfig.MAX_MAIN_DECK_CARD_COPIES;
  }

  private validateCard(card: {
    blueprint: CardBlueprint;
    copies: number;
  }): DeckViolation[] {
    const violations: DeckViolation[] = [];

    if (card.blueprint.kind === CARD_KINDS.GENERAL && card.copies > 1) {
      violations.push({
        type: 'too_many_copies_general',
        reason: `Deck must have exactly 1 general.`
      });
    }
    if (card.copies > defaultConfig.MAX_MAIN_DECK_CARD_COPIES) {
      violations.push({
        type: 'too_many_copies',
        reason: `Card ${card.blueprint.name} has too many copies.`
      });
    }

    return violations;
  }

  private getSize(cards: Array<{ copies: number }>) {
    return cards.reduce((acc, card) => acc + card.copies, 0);
  }

  validate(deck: ValidatableDeck<TMeta>): DeckValidationResult {
    const violations: DeckViolation[] = [];

    if (this.getSize(deck.cards) !== defaultConfig.MAX_MAIN_DECK_SIZE) {
      violations.push({
        type: 'invalid_deck_size',
        reason: `Deck must have exactly ${defaultConfig.MAX_MAIN_DECK_SIZE} cards.`
      });
    }

    const generals = deck.cards.filter(card => {
      const blueprint = this.cardPool[card.blueprintId];
      return blueprint?.kind === CARD_KINDS.GENERAL;
    });
    if (generals.length !== 1) {
      violations.push({
        type: 'invalid_general_count',
        reason: `Deck must have exactly 1 general.`
      });
    }

    for (const card of deck.cards) {
      const blueprint = this.cardPool[card.blueprintId];
      if (!blueprint) {
        violations.push({
          type: 'unknown_card',
          reason: `Card with Id ${card.blueprintId} not found in card pool.`
        });
      }

      violations.push(
        ...this.validateCard({
          blueprint,
          copies: card.copies
        })
      );
    }

    return { result: 'success' };
  }

  canAdd(card: ValidatableCard<TMeta>, deck: ValidatableDeck<TMeta>): boolean {
    const withBlueprint = deck.cards.map(card => ({
      ...card,
      blueprint: this.cardPool[card.blueprintId] as CardBlueprint
    }));

    const cardBlueprint = this.cardPool[card.blueprintId];
    if (!cardBlueprint) return false;

    if (withBlueprint.length >= this.size) {
      return false;
    }

    const alreadyHasGeneral = withBlueprint.some(
      c => c.blueprint.kind === CARD_KINDS.GENERAL
    );
    if (cardBlueprint.kind === CARD_KINDS.GENERAL && alreadyHasGeneral) {
      return false;
    }
    const existing = withBlueprint.find(c => deck.isEqual(c, card));
    if (existing && existing.copies >= this.maxCardCopies) {
      return false;
    }

    return true;
  }
}
