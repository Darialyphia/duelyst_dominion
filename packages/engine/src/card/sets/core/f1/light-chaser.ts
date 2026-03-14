import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { UnitSimpleRetaliationBuffModifier } from '../../../../modifier/modifiers/simple-retaliation-buff.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const lightChaser: MinionBlueprint = {
  id: 'light_chaser',
  name: 'Light Chaser',
  description: 'When a unit is healed, this gains +1/+1/+1.',
  vfx: {
    spriteId: 'minions/f1_lightchaser',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_immolation_b',
    walk: 'sfx_unit_run_charge_4',
    attack: 'sfx_spell_lastingjudgement',
    takeDamage: 'sfx_f1_silvermanevanguard_hit',
    dealDamage: 'sfx_f1_silvermanevanguard_attack_impact',
    death: 'sfx_f1_silverguardsquire_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  runeCost: {},
  manaCost: 2,
  atk: 1,
  maxHp: 4,
  retaliation: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('light-chaser-heal-watch', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_HEAL,
              async handler() {
                await card.unit.modifiers.add(
                  new UnitSimpleAttackBuffModifier('light-chaser-atk-buff', game, card, {
                    amount: 1,
                    name: 'Lightchaser Attack Buff'
                  })
                );
                await card.unit.modifiers.add(
                  new UnitSimpleRetaliationBuffModifier(
                    'light-chaser-ret-buff',
                    game,
                    card,
                    {
                      amount: 1,
                      name: 'Lightchaser Retaliation Buff'
                    }
                  )
                );
                await card.unit.modifiers.add(
                  new UnitSimpleHealthBuffModifier('light-chaser-hp-buff', game, card, {
                    amount: 1,
                    name: 'Lightchaser Health Buff'
                  })
                );
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
