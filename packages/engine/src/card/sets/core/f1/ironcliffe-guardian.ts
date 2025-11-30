import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { AirdropModifier } from '../../../../modifier/modifiers/airdrop.modifier';
import { ProvokeModifier } from '../../../../modifier/modifiers/provoke.modifier';

export const ironcliffeGuardian: MinionBlueprint = {
  id: 'ironcliffe_guardian',
  name: 'Ironcliffe Guardian',
  description: dedent`
  @Airdrop@, @Provoke@.`,
  sprite: { id: 'minions/f1_ironcliffe-guardian' },
  sounds: {},
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 5,
  runeCost: {
    yellow: 3
  },
  atk: 3,
  cmd: 2,
  maxHp: 10,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ProvokeModifier(game, card));
    await card.modifiers.add(new AirdropModifier(game, card));
  },
  async onPlay() {}
};
