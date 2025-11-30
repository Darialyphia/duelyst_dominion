import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import dedent from 'dedent';
import { RingAOEShape } from '../../../../aoe/ring.aoe-shape';

export const holyImmolation: SpellBlueprint = {
  id: 'holy-immolation',
  name: 'Holy Immolation',
  description: dedent`
  Heal an allied minion for 4 and deal 4 damage to enemies nearby it.`,
  sprite: { id: 'spells/f1_holy-immolation' },
  sounds: {},
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 4,
  runeCost: {
    yellow: 2
  },
  getAoe: () => new RingAOEShape(TARGETING_TYPE.ENEMY_UNIT, { size: 1 }),
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.isAlly(card.player)),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isAlly(card.player),
      getAoe() {
        return new RingAOEShape(TARGETING_TYPE.ENEMY_MINION, { size: 1 });
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    const targetToHeal = targets[0].unit;
    if (!targetToHeal) return;

    await targetToHeal.heal(card, 4);

    const unitsToDamage = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of unitsToDamage) {
      await unit.takeDamage(card, new SpellDamage(card, 4));
    }
  }
};
