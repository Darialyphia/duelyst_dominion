import { isDefined } from '@game/shared';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';

export const martyrdom: SpellBlueprint = {
  id: 'martyrdom',
  name: 'Martyrdom',
  description: 'Destroy an enemy minion. Your opponent gains 2 Victory Points.',
  cardIconId: 'spells/f1_martyrdom',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  manaCost: 2,
  runeCost: {
    blue: 2
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_MINION, {}),
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.isEnemy(card.player)),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isEnemy(card.player),
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.ENEMY_MINION, {});
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    const unitsToDestroy = aoe
      .getArea(targets)
      .map(point => game.unitSystem.getUnitAt(point))
      .filter(isDefined);

    for (const unit of unitsToDestroy) {
      await unit.destroy(card);
    }

    await card.player.opponent.earnVictoryPoints(2);
  }
};
