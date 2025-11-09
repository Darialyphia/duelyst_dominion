import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { argeonHighmane } from './core/f1/argeon-highmane';
import { archonSpellbinder } from './core/neutral/archon-spellbinder';
import { bloodtearAlchemist } from './core/neutral/bloodtear-alchemist';
import { healingMystic } from './core/neutral/healing-mystic';
import { primusShieldmaster } from './core/neutral/primus-shieldmaster';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    argeonHighmane,
    healingMystic,
    archonSpellbinder,
    primusShieldmaster,
    bloodtearAlchemist
  ]
};
