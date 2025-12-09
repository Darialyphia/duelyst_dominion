import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const lightChaser: MinionBlueprint = {
  id: 'light_chaser',
  name: 'Light Chaser',
  description: 'When a unit is healed, this gains +2/0',
  sprite: {
    id: 'minions/f1_light-chaser'
  },
  sounds: {
    play: 'sfx_spell_immolation_b.m4a',
    walk: 'sfx_unit_run_charge_4.m4a',
    attack: 'sfx_spell_lastingjudgement.m4a',
    takeDamage: 'sfx_f1_silvermanevanguard_hit.m4a',
    dealDamage: 'sfx_f1_silvermanevanguard_attack_impact.m4a',
    death: 'sfx_f1_silverguardsquire_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  runeCost: {
    red: 2
  },
  atk: 1,
  maxHp: 4,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('light-chaser-heal-watch', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_HEAL,
              async handler() {
                await card.unit.modifiers.add(
                  new UnitSimpleAttackBuffModifier('light-chaser-buff', game, card, {
                    amount: 2,
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
