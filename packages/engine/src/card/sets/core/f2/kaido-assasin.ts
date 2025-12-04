import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { BackstabModifier } from '../../../../modifier/modifiers/backstab.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const kaidoAssassin: MinionBlueprint = {
  id: 'kaido_assassin',
  name: 'Kaido Assassin',
  description: '@Backstab (1)@.',
  sprite: {
    id: 'minions/f1_kaido-assassin'
  },
  sounds: {},
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
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
    await card.modifiers.add(new BackstabModifier(game, card, { damageBonus: 1 }));
  },
  async onPlay() {}
};
