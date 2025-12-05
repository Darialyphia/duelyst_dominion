import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { isSpell } from '../../../card-utils';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';

export const chakriAvatar: MinionBlueprint = {
  id: 'chakri_avatar',
  name: 'Chakri Avatar',
  description: 'When you play a spell, this gains +1 / +1.',
  sprite: {
    id: 'minions/f2_chakri-avatar'
  },
  sounds: {},
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  runeCost: {},
  atk: 2,
  cmd: 1,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier('chakri-avatar', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event => {
              if (!event) return false;
              return (
                isSpell(event.data.card) && event.data.card.player.equals(card.player)
              );
            },
            async handler() {
              await card.unit.modifiers.add(
                new UnitSimpleAttackBuffModifier('chakri-avatar-atk-buff', game, card, {
                  amount: 1
                })
              );
              await card.unit.modifiers.add(
                new UnitSimpleHealthBuffModifier('chakri-avatar-hp-buff', game, card, {
                  amount: 1
                })
              );
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
