import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { arclyteRegalia } from './core/f1/arclyte-regalia';
import { argeonHighmane } from './core/f1/argeon-highmane';
import { augury } from './core/f1/augury';
import { azuriteLion } from './core/f1/azurite-lion';
import { circleOfLife } from './core/f1/circle-of-life';
import { divineBond } from './core/f1/divine-bond';
import { holyImmolation } from './core/f1/holy-immolation';
import { ironcliffeGuardian } from './core/f1/ironcliffe-guardian';
import { lightChaser } from './core/f1/light-chaser';
import { magnetize } from './core/f1/magnetize';
import { martyrdom } from './core/f1/martyrdom';
import { silverguardKnight } from './core/f1/silverguard-knight';
import { sundropElixir } from './core/f1/sundrop-elixir';
import { sunriser } from './core/f1/sunriser';
import { suntideMaiden } from './core/f1/suntide-maiden';
import { tempest } from './core/f1/tempest';
import { trueStrike } from './core/f1/true-strike';
import { warSurge } from './core/f1/war-surge';
import { windbladeAdept } from './core/f1/windblade-adept';
import { chakriAvatar } from './core/f2/chakri-avatar';
import { ghostLightning } from './core/f2/ghost-lightning';
import { heavensEclipse } from './core/f2/heavens-eclipse';
import { kaidoAssassin } from './core/f2/kaido-assasin';
import { kaleosXaan } from './core/f2/kaleos-xaan';
import { keshraiFanblade } from './core/f2/keshrai-fanblade';
import { killingEdge } from './core/f2/killing-edge';
import { maskOfTheMantis } from './core/f2/mask-of-the-mantis';
import { massacreArtist } from './core/f2/massacre-artist';
import { mistDragonSeal } from './core/f2/mist-dragon-seal';
import { phoenixFire } from './core/f2/phoenix-fire';
import { tuskBoar } from './core/f2/tusk-boar';
import { circletOfInhibition } from './core/f3/circlet-of-inhibition';
import { scionsCrown } from './core/f3/scions-crown';
import { archonSpellbinder } from './core/neutral/archon-spellbinder';
import { bloodtearAlchemist } from './core/neutral/bloodtear-alchemist';
import { emeraldRejuvinator } from './core/neutral/emerald-rejuvinator';
import { flamebloodWarlock } from './core/neutral/flameblood-warlock';
import { frostboneNaga } from './core/neutral/frostbone-naga';
import { healingMystic } from './core/neutral/healing-mystic';
import { primusShieldmaster } from './core/neutral/primus-shieldmaster';
import { saberspineTiger } from './core/neutral/saberspine-tiger';
import { voidHunter } from './core/neutral/void-hunter';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    argeonHighmane,
    healingMystic,
    archonSpellbinder,
    primusShieldmaster,
    bloodtearAlchemist,
    flamebloodWarlock,
    saberspineTiger,
    tempest,
    windbladeAdept,
    silverguardKnight,
    azuriteLion,
    emeraldRejuvinator,
    ironcliffeGuardian,
    frostboneNaga,
    holyImmolation,
    martyrdom,
    trueStrike,
    warSurge,
    suntideMaiden,
    magnetize,
    divineBond,
    kaleosXaan,
    circletOfInhibition,
    scionsCrown,
    maskOfTheMantis,
    kaidoAssassin,
    keshraiFanblade,
    chakriAvatar,
    phoenixFire,
    massacreArtist,
    voidHunter,
    ghostLightning,
    mistDragonSeal,
    killingEdge,
    heavensEclipse,
    tuskBoar,
    sundropElixir,
    augury,
    lightChaser,
    circleOfLife,
    sunriser,
    arclyteRegalia
  ]
};
