import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
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
    play: 'sfx_unit_deploy_1',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f2general_attack_swing',
    takeDamage: 'sfx_f2general_hit_2',
    dealDamage: 'sfx_f2general_attack_impact_3',
    death: 'sfx_f2general_death'
  },
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.BASIC,
  tags: [],
  runeCost: {},
  atk: 2,
  maxHp: 7,
  retaliation: 2,
  abilities: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_GENERAL, {}),
  async onInit() {}
};
