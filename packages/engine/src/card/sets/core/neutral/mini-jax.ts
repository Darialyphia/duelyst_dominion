import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { RangedModifier } from '../../../../modifier/modifiers/ranged.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const miniJax: MinionBlueprint = {
  id: 'mini-jax',
  name: 'Mini-Jax',
  description: '@Ranged@.',
  vfx: {
    spriteId: 'minions/neutral_minijax',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy_2',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_jaxtruesight_attack_swing',
    takeDamage: 'sfx_neutral_firespitter_hit',
    dealDamage: 'sfx_neutral_jaxtruesight_attack_impact',
    death: 'sfx_neutral_jaxtruesight_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: false,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.TOKEN,
  tags: [],
  runeCost: {},
  manaCost: 3,
  atk: 1,
  maxHp: 1,
  retaliation: 1,
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RangedModifier(game, card, {}));
  },
  async onPlay() {}
};
