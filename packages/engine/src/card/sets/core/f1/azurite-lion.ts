import dedent from 'dedent';
import { CelerityCardModifier } from '../../../../modifier/modifiers/celerity.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { MinionSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { RuneCostToggleModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const azuriteLion: MinionBlueprint = {
  id: 'azurite_lion',
  name: 'Azurite Lion',
  description: dedent /*html*/ `
  <rt-keyword>Celerity</rt-keyword>
  <br />
  <rt-runes runes="might,might,focus"></rt-runes> +1 Attack.
  `,
  vfx: {
    spriteId: 'minions/f1_azurite-lion',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_diretidefrenzy',
    walk: 'sfx_neutral_arakiheadhunter_hit',
    attack: 'sfx_neutral_beastsaberspinetiger_attack_swing',
    dealDamage: 'sfx_neutral_beastsaberspinetiger_hit',
    takeDamage: 'sfx_neutral_beastsaberspinetiger_attack_impact',
    death: 'sfx_neutral_beastphasehound_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 3,
  atk: 2,
  maxHp: 5,
  retaliation: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new CelerityCardModifier(game, card));
    await card.modifiers.add(
      new MinionSimpleAttackBuffModifier('azurite-lion-atk-buff', game, card, {
        amount: 1,
        mixins: [new RuneCostToggleModifierMixin(game, card, { might: 2, focus: 1 })]
      })
    );
  },
  async onPlay() {}
};
