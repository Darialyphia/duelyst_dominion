import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, RUNES } from '../../../card.enums';

export const spiritOfVitality: MinionBlueprint = {
  id: 'spirit-of-vitality',
  name: 'Spirit of Vitality',
  description: '@On Enter@: gain @[rune:yellow]@.',
  cardIconId: 'minions/neutral_spirit-of-vitality',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 2,
  runeCost: {},
  atk: 1,
  cmd: 1,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        card.player.gainRune(RUNES.YELLOW, 1);
      })
    );
  },
  async onPlay() {}
};
