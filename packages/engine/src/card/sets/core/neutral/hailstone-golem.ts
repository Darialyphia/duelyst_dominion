import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';

export const hailstoneGolem: MinionBlueprint = {
  id: 'hailstone-golem',
  name: 'Hailstone Golem',
  description: '',
  vfx: {
    spriteId: 'minions/neutral_hailstone-golem',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f6_boreanbear_attack_impact',
    takeDamage: 'sfx_neutral_hailstonehowler_hit',
    dealDamage: 'sfx_neutral_hailstonehowler_impact',
    death: 'sfx_neutral_hailstonehowler_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [TAGS.GOLEM],
  runeCost: {},
  manaCost: 4,
  atk: 3,
  maxHp: 7,
  retaliation: 3,
  abilities: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
