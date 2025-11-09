import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnCaptureModifier } from '../../../../modifier/modifiers/on-capture.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const sojourner: MinionBlueprint = {
  id: 'sojourner',
  name: 'Sojourner',
  description: '@On Capture@: Draw 2.',
  cardIconId: 'minions/neutral_sojourner',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 3,
  runeCost: {
    blue: 2
  },
  atk: 1,
  cmd: 1,
  maxHp: 5,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnCaptureModifier(game, card, {
        handler: async () => {
          await card.player.cardManager.draw(2);
        }
      })
    );
  },
  async onPlay() {}
};
