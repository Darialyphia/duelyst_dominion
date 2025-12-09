import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const saberspineTiger: MinionBlueprint = {
  id: 'saberspine-tiger',
  name: 'Saberspine Tiger',
  description: '@Rush@.',
  sprite: { id: 'minions/neutral_saberspine-tiger' },
  sounds: {
    play: 'sfx_unit_deploy_1.m4a',
    walk: 'sfx_neutral_ladylocke_attack_impact.m4a',
    attack: 'sfx_f6_boreanbear_attack_swing.m4a',
    takeDamage: 'sfx_neutral_beastsaberspinetiger_hit.m4a',
    dealDamage: 'sfx_neutral_beastsaberspinetiger_attack_impact.m4a',
    death: 'sfx_neutral_beastsaberspinetiger_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 3,
  runeCost: {
    red: 2
  },
  atk: 3,
  maxHp: 2,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card));
  },
  async onPlay() {}
};
