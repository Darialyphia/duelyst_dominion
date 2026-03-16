import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { UnitEffectModifierMixin } from '../../../../modifier/mixins/unit-effect.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitEffectTriggeredEvent } from '../../../../unit/unit-events';
import type { Unit } from '../../../../unit/unit.entity';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const sojourner: MinionBlueprint = {
  id: 'sojourner',
  name: 'Sojourner',
  description: 'After this attacks, draw a card.',
  vfx: {
    spriteId: 'minions/neutral_sojourner',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_gambitgirl_attack_swing',
    takeDamage: 'sfx_neutral_gambitgirl_hit',
    dealDamage: 'sfx_neutral_gambitgirl_attack_impact',
    death: 'sfx_neutral_gambitgirl_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  runeCost: {},
  manaCost: 3,
  atk: 2,
  maxHp: 5,
  retaliation: 1,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier('sojourner-card', game, card, {
        mixins: [
          new UnitEffectModifierMixin(game, {
            getModifier(unit) {
              return new Modifier<Unit>('sojourner-effect', game, card, {
                mixins: [
                  new GameEventModifierMixin(game, {
                    eventName: GAME_EVENTS.UNIT_AFTER_ATTACK,
                    filter: event => !!event?.data.unit.equals(unit),
                    handler: async () => {
                      await game.emit(
                        GAME_EVENTS.UNIT_EFFECT_TRIGGERED,
                        new UnitEffectTriggeredEvent({ unit: card.unit })
                      );
                      await card.player.cardManager.drawFromDeck(1);
                    }
                  })
                ]
              });
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
