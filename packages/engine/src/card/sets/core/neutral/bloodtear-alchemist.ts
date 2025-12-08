import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const bloodtearAlchemist: MinionBlueprint = {
  id: 'bloodtear-alchemist',
  name: 'Bloodtear Alchemist',
  description: '@On Enter@: Deal 1 damage to an enemy minion.',
  sprite: { id: 'minions/neutral_bloodtear-alchemist' },
  sounds: {},
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  runeCost: {
    blue: 1
  },
  atk: 2,
  maxHp: 1,
  getTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, { required: false });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async event => {
        const [target] = event.data.targets;
        if (!target) return;
        await target.unit?.takeDamage(card, new AbilityDamage(card, 1));
      })
    );
  },
  async onPlay() {}
};
