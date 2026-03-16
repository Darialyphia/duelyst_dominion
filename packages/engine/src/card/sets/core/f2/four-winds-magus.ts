import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { isSpell } from '../../../card-utils';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import { UnitEffectTriggeredEvent } from '../../../../unit/unit-events';

export const fourWindsMagus: MinionBlueprint = {
  id: 'four-winds-magus',
  name: 'Four Winds Magus',
  description: `After you play a spell, deal 1 damage to all units in this unit's column.`,
  vfx: {
    spriteId: 'minions/f2_four-winds-magus',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_deathstrikeseal',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f2_mage4winds_attack_swing',
    takeDamage: 'sfx_f2_mage4winds_hit',
    dealDamage: 'sfx_f2_mage4winds_impact',
    death: 'sfx_f2_mage4winds_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.RARE,
  tags: [],
  runeCost: {},
  manaCost: 4,
  atk: 3,
  maxHp: 5,
  retaliation: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('four-winds-magus', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.CARD_AFTER_PLAY,
              filter: event => {
                if (!event) return false;
                if (!event.data.card.player.equals(card.player)) return false;
                return isSpell(event.data.card);
              },
              async handler() {
                const columnUnits = card.unit.unitsOnSameColumn;
                await game.emit(
                  GAME_EVENTS.UNIT_EFFECT_TRIGGERED,
                  new UnitEffectTriggeredEvent({ unit: card.unit })
                );
                for (const unit of columnUnits) {
                  await unit.takeDamage(card, new AbilityDamage(card, 1));
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
