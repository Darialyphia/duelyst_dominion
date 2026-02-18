import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { IntimidateCardModifier } from '../../../../modifier/modifiers/intimidate.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { GeneralBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const argeonHighmane: GeneralBlueprint = {
  id: 'argeon-highmane',
  name: 'Argeon Highmane',
  description: '@Intimidate@.',
  vfx: {
    spriteId: 'generals/f1_argeon-highmane'
  },
  sounds: {
    play: 'sfx_unit_deploy',
    walk: 'sfx_unit_run_charge_4',
    attack: 'sfx_f1_general_attack_swing',
    dealDamage: 'sfx_f6_draugarlord_attack_impact_',
    takeDamage: 'sfx_f1_general_hit',
    death: 'sfx_f1general_death'
  },
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 3,
  runeCost: {},
  atk: 2,
  maxHp: 5,
  retaliation: 2,
  abilities: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_GENERAL, {}),
  async onInit(game, card) {
    await card.modifiers.add(new IntimidateCardModifier(game, card));
  }
};
