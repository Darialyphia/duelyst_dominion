import dedent from 'dedent';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { MinionOnDestroyModifier } from '../../../../modifier/modifiers/on-destroy.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent /*html*/ `
  <rt-keyword>On Destroyed</rt-keyword>: Inflict <rt-keyword>Burn 1</rt-keyword> to enemies on the same column.
  `,
  vfx: { spriteId: 'minions/f3_pyromancer' },
  sounds: {
    play: 'sfx_ui_booster_packexplode',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f1_oserix_attack_swing',
    takeDamage: 'sfx_f1_oserix_hit',
    dealDamage: 'sfx_f1_oserix_attack_impact',
    death: 'sfx_f1_oserix_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.COMMON,
  tags: [TAGS.DERVISH],
  manaCost: 1,
  atk: 2,
  maxHp: 2,
  retaliation: 0,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnDestroyModifier(game, card, {
        async handler(event) {
          const targets = game.boardSystem
            .getColumn(event.data.destroyedAt.x)
            .map(cell => cell.unit)
            .filter(unit => unit?.isEnemy(card.player));

          for (const target of targets) {
            await target?.modifiers.add(new BurnModifier(game, card, { stacks: 1 }));
          }
        }
      })
    );
  },
  async onPlay() {}
};
