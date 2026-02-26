import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';

export const bloodshardGolem: MinionBlueprint = {
  id: 'bloodshard-golem',
  name: 'Bloodshard Golem',
  description: '',
  vfx: {
    spriteId: 'minions/neutral_bloodshard-golem',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy',
    walk: 'sfx_unit_physical_4',
    attack: 'sfx_f4_blacksolus_attack_impact',
    takeDamage: 'sfx_neutral_brightmossgolem_hit',
    dealDamage: 'sfx_neutral_brightmossgolem_attack_impact',
    death: 'sfx_neutral_brightmossgolem_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [TAGS.GOLEM],
  runeCost: {},
  manaCost: 3,
  atk: 2,
  maxHp: 6,
  retaliation: 2,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
