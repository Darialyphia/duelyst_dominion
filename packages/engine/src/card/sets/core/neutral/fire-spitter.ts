import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { RangedModifier } from '../../../../modifier/modifiers/ranged.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const fireSpitter: MinionBlueprint = {
  id: 'fire-spitter',
  name: 'Fire Spitter',
  description: '@Ranged@.',
  vfx: {
    spriteId: 'minions/neutral_fire-spitter',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy_1',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_firespitter_attack_swing',
    takeDamage: 'sfx_neutral_firespitter_hit',
    dealDamage: 'sfx_neutral_firespitter_attack_impact',
    death: 'sfx_neutral_firespitter_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [],
  runeCost: {},
  manaCost: 2,
  atk: 2,
  maxHp: 0,
  retaliation: 4,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RangedModifier(game, card, {}));
  },
  async onPlay() {}
};
