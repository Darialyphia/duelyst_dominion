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

export const rythmweaver: MinionBlueprint = {
  id: 'rythmweaver',
  name: 'Rythmweaver',
  description: 'When this takes damage, draw a spell.',
  vfx: {
    spriteId: 'minions/f2_rythmweaver',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_neutral_ubo_attack_swing',
    walk: 'sfx_neutral_ubo_attack_swing',
    attack: 'sfx_neutral_prophetofthewhite_attack_swing',
    takeDamage: 'sfx_neutral_prophetofthewhite_hit',
    dealDamage: 'sfx_neutral_prophetofthewhite_impact',
    death: 'sfx_neutral_prophetofthewhite_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 1,
  atk: 1,
  maxHp: 2,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('rythmweaver', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
              filter: event => {
                if (!event) return false;
                return event.data.unit.equals(card.unit);
              },
              async handler() {
                await card.player.cardManager.drawFromPool(
                  card.player.cardManager.deck.cards.filter(isSpell),
                  1
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
