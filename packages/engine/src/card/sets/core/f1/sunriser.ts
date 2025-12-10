import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const sunriser: MinionBlueprint = {
  id: 'sunriser',
  name: 'Sunriser',
  description: 'After a unit is healed, deal 2 damage to nearby enemies.',
  vfx: {
    spriteId: 'minions/f1_sunriser',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_immolation_b.m4a',
    walk: 'sfx_neutral_ladylocke_attack_impact.m4a',
    attack: 'sfx_f2melee_attack_swing_2.m4a',
    takeDamage: 'sfx_f2melee_hit_2.m4a',
    dealDamage: 'sfx_f2melee_attack_impact_1.m4a',
    death: 'sfx_f2melee_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 4,
  runeCost: {
    red: 2
  },
  atk: 3,
  maxHp: 4,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('sunriser-heal-damage', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_HEAL,
              async handler() {
                const targets = card.unit.nearbyUnits.filter(u => u.isEnemy(card.unit));
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
