import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { AirdropModifier } from '../../../../modifier/modifiers/airdrop.modifier';
import { ProvokeModifier } from '../../../../modifier/modifiers/provoke.modifier';
import { consume } from '../../../card-actions-utils';

export const ironcliffeGuardian: MinionBlueprint = {
  id: 'ironcliffe_guardian',
  name: 'Ironcliffe Guardian',
  description: dedent`
  @Consume@ @[rune:yellow]@ @[rune:yellow]@.
  @Airdrop@, @Provoke@.`,
  cardIconId: 'minions/f1_ironcliffe-guardian',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 2,
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
    await consume(card, { yellow: 2 });
    await card.modifiers.add(new ProvokeModifier(game, card));
    await card.modifiers.add(new AirdropModifier(game, card));
  },
  async onPlay() {}
};
