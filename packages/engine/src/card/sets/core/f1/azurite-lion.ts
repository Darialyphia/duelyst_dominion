import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { CelerityModifier } from '../../../../modifier/modifiers/celerity.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const azuriteLion: MinionBlueprint = {
  id: 'azurite_lion',
  name: 'Azurite Lion',
  description: '@Celerity@.',
  sprite: { id: 'minions/f1_azurite-lion' },
  sounds: {},
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  runeCost: {
    red: 1
  },
  atk: 2,
  cmd: 1,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new CelerityModifier(game, card));
  },
  async onPlay() {}
};
