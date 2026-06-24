import dedent from 'dedent';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { Unit } from '../../../../unit/unit.entity';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';

export const suntideMaiden: MinionBlueprint = {
  id: 'suntide_maiden',
  name: 'Suntide Maiden',
  description: dedent /*html*/ `
  <rt-keyword>Zeal</rt-keyword> : <rt-trigger>On Minion Attack</rt-trigger>: Inflict <rt-keyword>Burn 2</rt-keyword> to the target and heal other allies in the same row for 1.
  `,
  vfx: {
    spriteId: 'minions/f1_suntide-maiden',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_immolation_b',
    walk: 'sfx_unit_run_magical_4',
    attack: 'sfx_neutral_gambitgirl_attack_swing',
    takeDamage: 'sfx_neutral_luxignis_hit',
    dealDamage: 'sfx_neutral_jaxtruesight_death',
    death: 'sfx_neutral_pandora_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 4,
  atk: 2,
  maxHp: 6,
  retaliation: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier('suntide-maiden-zeal', game, card, {
        unitMixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.UNIT_BEFORE_ATTACK,
            filter: event => {
              return !!(
                event?.data.unit.card.equals(card) && event.data.target instanceof Unit
              );
            },
            async handler(event) {
              const targetUnit = event!.data.target as Unit;
              await targetUnit.modifiers.add(new BurnModifier(game, card, { stacks: 2 }));
              for (const ally of targetUnit.unitsOnSameRow) {
                await ally.heal(card, 1);
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
