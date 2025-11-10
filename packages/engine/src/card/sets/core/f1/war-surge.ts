import { isDefined } from '@game/shared';
import { CompositeAOEShape } from '../../../../aoe/composite.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhere } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import type { Game } from '../../../../game/game';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';

const getAOE = (game: Game) =>
  new CompositeAOEShape(TARGETING_TYPE.ALLY_MINION, {
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

export const warSurge: SpellBlueprint = {
  id: 'war-surge',
  name: 'War Surge',
  description: 'Give allied minions at a shrine +1 Attack and +1 Commandment.',
  cardIconId: 'spells/f1_war_surge',
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
    const unitsToBuff = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of unitsToBuff) {
      await unit.modifiers.add(
        new UnitSimpleAttackBuffModifier('war-surge-atk-buff', game, card, {
          amount: 1
        })
      );
      await unit.modifiers.add(
        new UnitSimpleHealthBuffModifier('war-surge-hp-buff', game, card, {
          amount: 1
        })
      );
    }
  }
};
