import { isDefined } from '@game/shared';
import { CompositeAOEShape } from '../../../../aoe/composite.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhere } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import type { Game } from '../../../../game/game';

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

export const tempest: SpellBlueprint = {
  id: 'tempest',
  name: 'Tempest',
  description: 'Deal 2 damae to all units at a shrine.',
  cardIconId: 'spells/f1_tempest',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  manaCost: 2,
  runeCost: {
    red: 2
  },
  getAoe: getAOE,
  canPlay: () => true,
  getTargets(game, card) {
    return anywhere.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, {
      getAoe: () => getAOE(game)
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    const unitsToDamage = aoe
      .getArea(targets)
      .map(point => game.unitSystem.getUnitAt(point))
      .filter(isDefined);

    for (const unit of unitsToDamage) {
      await unit.takeDamage(card, new SpellDamage(card, 2));
    }
  }
};
