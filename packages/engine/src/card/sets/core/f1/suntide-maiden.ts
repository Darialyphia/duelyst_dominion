import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const suntideMaiden: MinionBlueprint = {
  id: 'suntide_maiden',
  name: 'Suntide Maiden',
  description: '@Zeal@ : fully heal this unit at the end of your turn.',
  sprite: { id: 'minions/f1_suntide-maiden' },
  sounds: {},
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 4,
  runeCost: {
    red: 1,
    yellow: 1
  },
  atk: 3,
  maxHp: 6,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier('suntide-maiden-zeal', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.PLAYER_END_TURN,
            filter(event) {
              return !!event?.data.player.equals(card.player);
            },
            handler: async () => {
              await card.unit.heal(card, card.unit.maxHp - card.unit.remainingHp);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
