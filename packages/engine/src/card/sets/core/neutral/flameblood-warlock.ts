import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const flamebloodWarlock: MinionBlueprint = {
  id: 'flameblood-warlock',
  name: 'Flameblood Warlock',
  description: '@On Enter@: Deal 3 damage to all generals.',
  vfx: {
    spriteId: 'minions/neutral_flameblood-warlock',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy_2',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f4_engulfingshadow_attack_swing',
    takeDamage: 'sfx_f4_engulfingshadow_attack_impact',
    dealDamage: 'sfx_f4_engulfingshadow_hit',
    death: 'sfx_f6_icebeetle_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 2,
  runeCost: {
    red: 1
  },
  atk: 3,
  maxHp: 1,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        for (const player of game.playerSystem.players) {
          await player.general?.takeDamage(card, new AbilityDamage(card, 3));
        }
      })
    );
  },
  async onPlay() {}
};
