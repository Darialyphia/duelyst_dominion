import dedent from 'dedent';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';
import { RUNES } from '../../../../player/player.enums';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';

export const windbladeAdept: MinionBlueprint = {
  id: 'windblade_adept',
  name: 'Windblade Adept',
  description: dedent /*html*/ `<rt-keyword>Zeal 1</rt-keyword> +1 Attack.
  <rt-trigger>On Enter</rt-trigger> You may consume <rt-runes runes="might"></rt-runes> to give this <rt-keyword>Rush</rt-keyword>.
  `,
  vfx: {
    spriteId: 'minions/f1_windblade-adept',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_immolation_b',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f2melee_attack_swing_2',
    takeDamage: 'sfx_f2melee_hit_2',
    dealDamage: 'sfx_f2melee_attack_impact_1',
    death: 'sfx_f2melee_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  atk: 2,
  maxHp: 4,
  retaliation: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier('windblade-adept-zeal', game, card, {
        amount: 1,
        unitMixins: [
          new UnitInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor: value => value + 1
          })
        ]
      })
    );

    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, {
        timing: 'after',
        async handler() {
          if (!card.player.runeManager.has({ might: 1 })) {
            return;
          }

          const shouldRush = await askMandatoryYesNoQuestion({
            game,
            card,
            label: 'Consume 1 Might Rune to give this Rush?',
            questionId: 'windblade-adept-rush',
            timeoutFallback: 'no'
          });

          if (!shouldRush) return;

          await card.player.runeManager.remove([RUNES.MIGHT]);
          await card.modifiers.add(new RushModifier(game, card));
        }
      })
    );
  },
  async onPlay() {}
};
