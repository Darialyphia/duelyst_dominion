import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const saberspineTiger: MinionBlueprint = {
  id: 'saberspine-tiger',
  name: 'Saberspine Tiger',
  description: '@Rush@.',
  vfx: {
    spriteId: 'minions/neutral_saberspine-tiger',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy_1',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f6_boreanbear_attack_swing',
    takeDamage: 'sfx_neutral_beastsaberspinetiger_hit',
    dealDamage: 'sfx_neutral_beastsaberspinetiger_attack_impact',
    death: 'sfx_neutral_beastsaberspinetiger_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 3,
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
