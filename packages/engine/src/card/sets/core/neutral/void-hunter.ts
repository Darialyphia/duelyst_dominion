import dedent from 'dedent';
import { MinionOnDestroyModifier } from '../../../../modifier/modifiers/on-destroy.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const voidHunter: MinionBlueprint = {
  id: 'void-hunter',
  name: 'Void Hunter',
  description: dedent /*html*/ `
  <rt-trigger>On Destroyed</rt-trigger>: Draw 2 cards.`,
  vfx: {
    spriteId: 'minions/neutral_void-hunter',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_voidpulse',
    walk: 'sfx_neutral_chaoselemental_hit',
    attack: 'sfx_voidhunter_attack_swing',
    takeDamage: 'sfx_voidhunter_hit',
    dealDamage: 'sfx_voidhunter_attack_impact',
    death: 'sfx_voidhunter_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 3,
  atk: 3,
  maxHp: 3,
  retaliation: 1,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnDestroyModifier(game, card, {
        async handler() {
          await card.player.cardManager.drawFromDeck(2);
        }
      })
    );
  },
  async onPlay() {}
};
