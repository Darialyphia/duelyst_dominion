import { isDefined } from '@game/shared';
import { CompositeAOEShape } from '../../../../aoe/composite.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhere, singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import type { Game } from '../../../../game/game';
import dedent from 'dedent';
import { RingAOEShape } from '../../../../aoe/ring.aoe-shape';

const getAOE = (game: Game) =>
  new CompositeAOEShape(TARGETING_TYPE.UNIT, {
    shapes: game.boardSystem.shrines
      .map(shrine => shrine.neighborUnits)
      .flat()
      .flatMap(unit => ({
        type: 'point' as const,
        params: {
          override: unit.position.serialize()
        },
        pointIndices: [0]
      }))
  });

export const holyImmolation: SpellBlueprint = {
  id: 'holy-immolation',
  name: 'Holy Immolation',
  description: dedent`
  @Consume@ @[mana:yellow]@
  Heal an allied minion for 4 and deal 4 damage to enemies nearby it.`,
  cardIconId: 'spells/f1_holy-immolation',
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
  getAoe: () => new RingAOEShape(TARGETING_TYPE.ENEMY_MINION, { size: 1 }),
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

    const unitsToDamage = aoe
      .getArea(targets)
      .map(point => game.unitSystem.getUnitAt(point))
      .filter(isDefined);

    for (const unit of unitsToDamage) {
      await unit.takeDamage(card, new SpellDamage(card, 4));
    }
  }
};
