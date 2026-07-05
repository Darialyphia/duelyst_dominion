import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';

export const incinera: MinionBlueprint = {
  id: 'incinera',
  name: 'Incinera',
  description: dedent /*html*/ `
  <rt-keyword>On Enter</rt-keyword> Inflict <rt-keyword>Burn 1</rt-keyword> to all enemies.
  <rt-runes runes="might,wisdom,focus"></rt-runes> this costs <rt-mana>2</rt-mana> less.
  `,
  vfx: { spriteId: 'minions/f3_fusion-banshee' },
  sounds: {
    play: 'sfx_spell_blindscorch',
    walk: 'sfx_neutral_sai_attack_impact',
    attack: 'sfx_spell_blaststarfire',
    takeDamage: 'sfx_f4_engulfingshadow_attack_impact',
    dealDamage: 'sfx_spell_immolation_a',
    death: 'sfx_f1_elyxstormblade_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.EPIC,
  tags: [TAGS.DERVISH],
  manaCost: 6,
  atk: 3,
  maxHp: 5,
  retaliation: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, {
        timing: 'after',
        async handler() {
          for (const unit of card.player.enemyUnits) {
            await unit.modifiers.add(new BurnModifier(game, card, { stacks: 1 }));
          }
        }
      })
    );
  },
  async onPlay() {}
};
