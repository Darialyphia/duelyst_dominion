import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { ProvokeModifier } from '../../../../modifier/modifiers/provoke.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const primusShieldmaster: MinionBlueprint = {
  id: 'primus-shieldmaster',
  name: 'Primus Shieldmaster',
  description: '@Provoke@.',
  sprite: { id: 'minions/neutral_primus-shieldmaster' },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.BASIC,
  tags: [],
  manaCost: 4,
  runeCost: {
    red: 1,
    yellow: 1
  },
  atk: 3,
  cmd: 1,
  maxHp: 6,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ProvokeModifier(game, card));
  },
  async onPlay() {}
};
