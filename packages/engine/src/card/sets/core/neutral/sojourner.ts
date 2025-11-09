import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnCaptureModifier } from '../../../../modifier/modifiers/on-capture.modifier';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
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
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, { required: false });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnCaptureModifier(game, card, async () => {
        await card.player.cardManager.draw(2);
      })
    );
  },
  async onPlay() {}
};
