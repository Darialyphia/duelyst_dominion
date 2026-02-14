import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { CleaveCardModifier } from '../../../../modifier/modifiers/cleave.modifier';
import { SlayModifier } from '../../../../modifier/modifiers/slay.modifier';
import { AbilityDamage } from '../../../../utils/damage';

export const dioltas: MinionBlueprint = {
  id: 'dioltas',
  name: 'Dioltas',
  description: dedent`
  @Cleave@.
  @Slay@: Deal 2 damage to the enemy a heal your for 2.
  `,
  vfx: {
    spriteId: 'minions/neutral_dioltas',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_ui_booster_packexplode',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f6_icebeetle_attack_swing',
    takeDamage: 'sfx_neutral_spelljammer_hit',
    dealDamage: 'sfx_neutral_spelljammer_attack_impact',
    death: 'sfx_neutral_spelljammer_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.EPIC,
  tags: [],
  runeCost: {},
  manaCost: 4,
  atk: 3,
  maxHp: 5,
  retaliation: 0,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new CleaveCardModifier(game, card));
    await card.modifiers.add(
      new SlayModifier(game, card, {
        async handler() {
          await card.player.opponent.takeDamage(card, new AbilityDamage(card, 2));
          await card.player.heal(card, 2);
        }
      })
    );
  },
  async onPlay() {}
};
