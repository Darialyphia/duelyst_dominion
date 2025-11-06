import { cards } from '@game/engine/src/generated/cards';

type PremadeDeck = {
  id: string;
  isGrantedOnAccountCreation: boolean;
  name: string;
  cards: Array<{
    blueprintId: string;
    copies: number;
    isFoil: boolean;
  }>;
};

export const premadeDecks: PremadeDeck[] = [
  {
    id: 'aiden-starter',
    isGrantedOnAccountCreation: true,
    name: 'Aiden Starter',
    cards: []
  }
];
