import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { RuneCostToggleModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const sunriser: MinionBlueprint = {
  id: 'sunriser',
  name: 'Sunriser',
  description: dedent /*html*/ `
  After a unit is healed, deal 2 damage to enemies in this column.
  <rt-runes runes="focus,resonance,wisdom"></rt-runes> This costs <rt-mana>1</rt-mana> less.
  `,
  vfx: {
    spriteId: 'minions/f1_sunriser',
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
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 4,
  atk: 3,
  maxHp: 5,
  retaliation: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('sunriser-mana-cost', game, card, {
        amount: -1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            focus: 1,
            resonance: 1,
            wisdom: 1
          })
        ]
      })
    );
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('sunriser-heal-damage', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_HEAL,
              async handler() {
                const targets = card.unit.unitsOnSameColumn.filter(unit =>
                  unit.isEnemy(card.unit)
                );
                for (const target of targets) {
                  await target.takeDamage(card, new AbilityDamage(card, 2));
                }
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
