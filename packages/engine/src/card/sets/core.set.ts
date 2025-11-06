import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { argeonHighmane } from './core/f1/argeon-highmane';
import { healingMystic } from './core/neutral/healing-mystic';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [argeonHighmane, healingMystic]
};
