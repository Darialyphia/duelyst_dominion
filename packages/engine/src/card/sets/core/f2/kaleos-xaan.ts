import type { GeneralBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const kaleosXaan: GeneralBlueprint = {
  id: 'kaleos-xaan',
  name: 'Kaleos Xaan',
  description: '',
  vfx: {
    spriteId: 'generals/f2_kaleos-xaan'
  },
  sounds: {
    play: 'sfx_unit_deploy_1.m4a',
    walk: 'sfx_neutral_ladylocke_attack_impact.m4a',
    attack: 'sfx_f2general_attack_swing.m4a',
    takeDamage: 'sfx_f2general_hit_2.m4a',
    dealDamage: 'sfx_f2general_attack_impact_3.m4a',
    death: 'sfx_f2general_death.m4a'
  },
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.BASIC,
  tags: [],
  atk: 2,
  maxHp: 25,
  abilities: [],
  async onInit() {}
};
