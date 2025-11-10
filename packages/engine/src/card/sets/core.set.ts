import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { argeonHighmane } from './core/f1/argeon-highmane';
import { azuriteLion } from './core/f1/azurite-lion';
import { holyImmolation } from './core/f1/holy-immolation';
import { ironcliffeGuardian } from './core/f1/ironcliffe-guardian';
import { magnetize } from './core/f1/magnetize';
import { martyrdom } from './core/f1/martyrdom';
import { silverguardKnight } from './core/f1/silverguard-knight';
import { suntideMaiden } from './core/f1/suntide-maiden';
import { tempest } from './core/f1/tempest';
import { trueStrike } from './core/f1/true-strike';
import { warJudicator } from './core/f1/war-judicator';
import { warSurge } from './core/f1/war-surge';
import { windbladeAdept } from './core/f1/windblade-adept';
import { archonSpellbinder } from './core/neutral/archon-spellbinder';
import { bloodtearAlchemist } from './core/neutral/bloodtear-alchemist';
import { deathBlighter } from './core/neutral/deathblighter';
import { emeraldRejuvinator } from './core/neutral/emerald-rejuvinator';
import { flamebloodWarlock } from './core/neutral/flameblood-warlock';
import { frostboneNaga } from './core/neutral/frostbone-naga';
import { healingMystic } from './core/neutral/healing-mystic';
import { primusShieldmaster } from './core/neutral/primus-shieldmaster';
import { saberspineTiger } from './core/neutral/saberspine-tiger';

import { sojourner } from './core/neutral/sojourner';
import { songweaver } from './core/neutral/songweaver';
import { spiritOfPower } from './core/neutral/spirit-of-power';
import { spiritOfVitality } from './core/neutral/spirit-of-vitality';
import { spiritOfWisdom } from './core/neutral/spirit-of-wisdom';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    argeonHighmane,
    healingMystic,
    archonSpellbinder,
    primusShieldmaster,
    bloodtearAlchemist,
    sojourner,
    flamebloodWarlock,
    saberspineTiger,
    tempest,
    windbladeAdept,
    silverguardKnight,
    azuriteLion,
    warJudicator,
    spiritOfPower,
    spiritOfVitality,
    spiritOfWisdom,
    emeraldRejuvinator,
    ironcliffeGuardian,
    frostboneNaga,
    holyImmolation,
    martyrdom,
    trueStrike,
    warSurge,
    suntideMaiden,
    deathBlighter,
    songweaver,
    magnetize
  ]
};
