import dedent from 'dedent';
import { MinionOnDestroyModifier } from '../../../../modifier/modifiers/on-destroy.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const flamebloodWarlock: MinionBlueprint = {
  id: 'flameblood-warlock',
  name: 'Flameblood Warlock',
  description: dedent /*html*/ `
  <rt-trigger>On Destroyed</rt-trigger>: if your opponent has initiative, they take 3 damage.
  `,
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
  manaCost: 1,
  atk: 1,
  maxHp: 1,
  retaliation: 0,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnDestroyModifier(game, card, {
        async handler() {
          if (game.turnSystem.initiativePlayer.equals(card.player.opponent)) {
            await card.player.opponent.takeDamage(card, new AbilityDamage(card, 3));
          }
        }
      })
    );
  },
  async onPlay() {}
};
