import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { consume } from '../../../card-actions-utils';

export const martyrdom: SpellBlueprint = {
  id: 'martyrdom',
  name: 'Martyrdom',
  description: dedent`
  @Consume@ @[rune:blue]@
  Destroy an enemy minion ans heal its owner's general for the amount of health thatm inion had .`,
  sprite: { id: 'spells/f1_martyrdom' },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 2,
  runeCost: {
    blue: 1
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
    await consume(card, { blue: 1 });
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    const amounttoHeal = target.remainingHp;
    await target.destroy(card);

    await target.player.general.heal(card, amounttoHeal);
  }
};
