import type { Game } from '../game/game';
import type { AnyCard } from './entities/card.entity';
import { type DeckCard } from './components/card-manager.component';
import type { Rune } from './card.enums';
export const scry = async (game: Game, card: AnyCard, amount: number) => {
  const cards = card.player.cardManager.deck.peek(amount);
  const cardsToPutAtBottom = await game.interaction.chooseCards<DeckCard>({
    player: card.player,
    minChoiceCount: 0,
    maxChoiceCount: amount,
    choices: cards,
    label: `Choose up to ${amount} cards to put at the bottom of your deck`,
    source: card
  });

  for (const card of cardsToPutAtBottom) {
    card.player.cardManager.deck.pluck(card);
    card.player.cardManager.deck.addToBottom(card);
  }

  return { cards, cardsToPutAtBottom };
};

export const discover = async (game: Game, card: AnyCard, choicePool: DeckCard[]) => {
  const choices: DeckCard[] = [];
  for (let i = 0; i < 3; i++) {
    const index = game.rngSystem.nextInt(choicePool.length - 1);
    choices.push(...choicePool.splice(index, 1));
  }
  const [selectedCard] = await game.interaction.chooseCards<DeckCard>({
    player: card.player,
    minChoiceCount: 1,
    maxChoiceCount: 1,
    choices,
    label: 'Choose a card to add to your hand',
    source: card
  });

  await selectedCard.addToHand();

  return { selectedCard, choices };
};

export const consume = async (card: AnyCard, runes: Partial<Record<Rune, number>>) => {
  Object.entries(runes).forEach(([rune, amount]) => {
    card.player.loseRune(rune as Rune, amount);
  });
};
