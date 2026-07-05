import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import { vetruvianSpawn } from '../../../card-vfx-sequences';
import dedent from 'dedent';
import { StructureModifier } from '../../../../modifier/modifiers/structure.modifier';
import { spawnDervish } from '../../../card-utils';

export const etherealObelysk: MinionBlueprint = {
  id: 'ethereal-obelysk',
  name: 'Ethereal Obelysk',
  description: dedent /*html*/ `
  <rt-keyword>Structure</rt-keyword>.
  `,
  vfx: {
    spriteId: 'minions/f3_ethereal_obelysk',
    sequences: {
      play(game, card, position) {
        return vetruvianSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_divineblood',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_monsterdreamoracle_attack_swing',
    takeDamage: 'sfx_neutral_monsterdreamoracle_hit',
    dealDamage: 'sfx_f1_general_attack_impact',
    death: 'sfx_neutral_golembloodshard_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.COMMON,
  tags: [TAGS.OBELYSK],
  manaCost: 2,
  atk: 0,
  maxHp: 4,
  retaliation: 0,
  canPlay: () => true,
  abilities: [spawnDervish()],
  async onInit(game, card) {
    await card.modifiers.add(new StructureModifier(game, card, {}));
  },
  async onPlay() {}
};
