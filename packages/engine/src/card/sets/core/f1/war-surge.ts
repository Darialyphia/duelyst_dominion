import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhere } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { EverywhereAOEShape } from '../../../../aoe/everywhere.aoe-shape';

export const warSurge: SpellBlueprint = {
  id: 'war-surge',
  name: 'War Surge',
  description: 'Give allied minions +1 / +1.',
  sprite: { id: 'spells/f1_war-surge' },
  sounds: {},
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 1,
  runeCost: {
    red: 1
  },
  getAoe: game =>
    new EverywhereAOEShape(TARGETING_TYPE.ALLY_MINION, {
      width: game.boardSystem.map.cols,
      height: game.boardSystem.map.rows
    }),
  canPlay: () => true,
  getTargets(game, card) {
    return anywhere.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, {
      getAoe: () =>
        new EverywhereAOEShape(TARGETING_TYPE.ALLY_MINION, {
          width: game.boardSystem.map.cols,
          height: game.boardSystem.map.rows
        })
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    const unitsToBuff = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);
    console.log('Units to buff:', unitsToBuff);
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
