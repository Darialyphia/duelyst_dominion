import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { isSpell } from '../../../card-utils';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { AbilityDamage } from '../../../../utils/damage';

export const fourWindsMagus: MinionBlueprint = {
  id: 'four-winds-magus',
  name: 'Four Winds Magus',
  description:
    'When you play a spell, deal 1 damage to the enemy General and heal your General for 1.',
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
  manaCost: 4,
  atk: 4,
  maxHp: 4,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('rythmweaver', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.CARD_AFTER_PLAY,
              filter: event => {
                if (!event) return false;
                if (!event.data.card.player.equals(card.player)) return false;
                return isSpell(event.data.card);
              },
              async handler() {
                await card.player.opponent.general.takeDamage(
                  card,
                  new AbilityDamage(card, 1)
                );
                await card.player.general.heal(card, 1);
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
