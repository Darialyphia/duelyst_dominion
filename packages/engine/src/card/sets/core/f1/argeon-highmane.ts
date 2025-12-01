import type { GeneralBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const argeonHighmane: GeneralBlueprint = {
  id: 'argeon-highmane',
  name: 'Argeon Highmane',
  description: '',
  sprite: {
    id: 'generals/f1_argeon-highmane'
  },
  sounds: {
    play: 'sfx_unit_deploy.m4a',
    walk: 'sfx_unit_run_charge_4.m4a',
    attack: 'sfx_f1_general_attack_swing.m4a',
    dealDamage: 'sfx_f6_draugarlord_attack_impact_.m4a',
    takeDamage: 'sfx_f1_general_hit.m4a',
    death: 'sfx_f1general_death.m4a'
  },
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  atk: 2,
  speed: 1,
  maxHp: 25,
  abilities: [],
  async onInit() {}
};
