import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { isSpell } from '../../../card-utils';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { DurationModifierMixin } from '../../../../modifier/mixins/duration.mixin';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import dedent from 'dedent';

export const keshraiFanblade: MinionBlueprint = {
  id: 'keshrai_fanblade',
  name: 'Keshrai Fanblade',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger>: Your opponent's spells cost 1 more until your next turn.
  `,
  vfx: {
    spriteId: 'minions/f2_keshrai-fanblade',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy_2',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f1_elyxstormblade_attack_swing',
    takeDamage: 'sfx_f1_elyxstormblade_hit',
    dealDamage: 'sfx_f1_elyxstormblade_attack_impact',
    death: 'sfx_f1_elyxstormblade_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 5,
  atk: 4,
  maxHp: 5,
  retaliation: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        const enemySpells = game.cardSystem.cards.filter(
          c => isSpell(c) && c.player.equals(card.player.opponent)
        );

        for (const spell of enemySpells) {
          await spell.modifiers.add(
            new SimpleManacostModifier('keshrai-fanblade-manacost', game, spell, {
              amount: 1,
              mixins: [
                new TogglableModifierMixin(game, () => card.location === 'hand'),
                new DurationModifierMixin(game, 2)
              ]
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
