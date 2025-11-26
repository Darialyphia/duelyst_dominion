import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';

export const trueStrike: SpellBlueprint = {
  id: 'true-strike',
  name: 'True Strike',
  description: 'Deal 2 damage to an  enemy minion.',
  sprite: { id: 'spells/f1_true-strike' },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  manaCost: 1,
  runeCost: {
    red: 1
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
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(card, 2));
  }
};
