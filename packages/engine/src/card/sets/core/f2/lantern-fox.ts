import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import dedent from 'dedent';
import { phoenixFire } from './phoenix-fire';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';

export const lanternFox: MinionBlueprint = {
  id: 'lantern-fox',
  name: 'Lantern Fox',
  description: dedent`
  When this takes damage, add a @${phoenixFire.name}@ to your hand.`,
  vfx: {
    spriteId: 'minions/f2_lantern-fox',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_deathstrikeseal',
    walk: 'sfx_unit_physical_4',
    attack: 'sfx_f2_lanternfox_attack_swing',
    takeDamage: 'sfx_f2_lanternfox_hit',
    dealDamage: 'sfx_f2_lanternfox_attack_impact',
    death: 'sfx_f2_lanternfox_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.EPIC,
  tags: [],
  runeCost: {},
  manaCost: 3,
  atk: 2,
  maxHp: 5,
  retaliation: 2,
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('lantern-fox', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
              filter(event) {
                return !!event?.data.unit.equals(card.unit);
              },
              async handler() {
                const pf = await card.player.generateCard(phoenixFire.id, card.isFoil);
                await pf.addToHand();
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
