import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, RUNES } from '../../../card.enums';

export const spiritOfWisdom: MinionBlueprint = {
  id: 'spirit-of-wisdom',
  name: 'Spirit of Wisdom',
  description: '@On Enter@: gain @[rune:blue]@.',
  cardIconId: 'minions/neutral_spirit-of-wisdom',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 2,
  runeCost: {
    red: 1
  },
  atk: 1,
  cmd: 1,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        card.player.gainRune(RUNES.BLUE, 1);
      })
    );
  },
  async onPlay() {}
};
