import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { isSpell } from '../../../card-utils';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import dedent from 'dedent';

export const chakriAvatar: MinionBlueprint = {
  id: 'chakri_avatar',
  name: 'Chakri Avatar',
  description: dedent /*html*/ `
  When you play a spell, this gains +1/+0/+1.
  Can only trigger once per turn unless you have <rt-runes runes="wisdom,wisdom,resonance"></rt-runes>
  `,
  vfx: {
    spriteId: 'minions/f2_chakri-avatar',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_deathstrikeseal',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f2_chakriavatar_attack_swing',
    takeDamage: 'sfx_f2_chakriavatar_hit',
    dealDamage: 'sfx_f2_chakriavatar_attack_impact',
    death: 'sfx_f2_chakriavatar_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  atk: 1,
  maxHp: 3,
  retaliation: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier('chakri-avatar', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            frequencyPerGameTurn: () =>
              card.player.runeManager.has({ wisdom: 2, resonance: 1 }) ? Infinity : 1,
            filter: event => {
              if (!event) return false;
              return (
                isSpell(event.data.card) && event.data.card.player.equals(card.player)
              );
            },
            async handler() {
              await card.unit.modifiers.add(
                new UnitSimpleAttackBuffModifier('chakri-avatar-atk-buff', game, card, {
                  amount: 1
                })
              );
              await card.unit.modifiers.add(
                new UnitSimpleHealthBuffModifier('chakri-avatar-hp-buff', game, card, {
                  amount: 1
                })
              );
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
