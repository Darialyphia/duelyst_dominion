import type { GeneralBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const argeonHighmane: GeneralBlueprint = {
  id: 'argeon-highmane',
  name: 'Argeon Highmane',
  description: '',
  sprite: {
    id: 'generals/f1_argeon-highmane'
  },
  sounds: {},
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  atk: 2,
  cmd: 1,
  maxHp: 25,
  abilities: [],
  async onInit() {}
};
