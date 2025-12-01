import type { GeneralBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const kaleosXaan: GeneralBlueprint = {
  id: 'kaleos-xaan',
  name: 'Kaleos Xaan',
  description: '',
  sprite: {
    id: 'generals/f2_kaleos-xaan'
  },
  sounds: {},
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.BASIC,
  tags: [],
  atk: 2,
  speed: 1,
  maxHp: 25,
  abilities: [],
  async onInit() {}
};
