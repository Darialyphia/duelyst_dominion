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
import dedent from 'dedent';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';

export const tuskBoar: MinionBlueprint = {
  id: 'tusk_boar',
  name: 'Tusk Boar',
  description: dedent`@Rush@.
  At the start of your turn, return this to your hand.`,
  vfx: {
    spriteId: 'minions/f2_tusk-boar'
  },
  sounds: {},
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  manaCost: 2,
  runeCost: {},
  atk: 2,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card));

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('tsusk-boar-bounce', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.PLAYER_START_TURN,
              filter(event) {
                if (!event) return false;
                return event.data.player.equals(card.player);
              },
              async handler() {
                await card.unit.bounce();
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
