import { type Faction, FACTIONS } from '@game/engine/src/card/card.enums';
import type { BetterExclude } from '@game/shared';

type PremadeDeck = {
  id: string;
  isGrantedOnAccountCreation: boolean;
  name: string;
  faction: BetterExclude<Faction, 'Neutral'>;
  cards: Array<{
    blueprintId: string;
    copies: number;
    isFoil: boolean;
  }>;
};

export const premadeDecks: PremadeDeck[] = [
  {
    id: 'layonar-starter',
    isGrantedOnAccountCreation: true,
    name: 'Lyonar Starter',
    faction: FACTIONS.F1,
    cards: []
  }
];
