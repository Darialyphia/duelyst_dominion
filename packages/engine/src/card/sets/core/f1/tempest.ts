import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhere } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { EverywhereAOEShape } from '../../../../aoe/everywhere.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';

export const tempest: SpellBlueprint = {
  id: 'tempest',
  name: 'Tempest',
  description: 'Deal 2 damage to all units.',
  sprite: {
    id: 'spells/f1_tempest'
  },
  sounds: {},
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  runeCost: {
    red: 2
  },
  getAoe: game =>
    new EverywhereAOEShape(TARGETING_TYPE.UNIT, {
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
        new EverywhereAOEShape(TARGETING_TYPE.UNIT, {
          width: game.boardSystem.map.cols,
          height: game.boardSystem.map.rows
        })
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    const unitsToDamage = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of unitsToDamage) {
      await unit.takeDamage(card, new SpellDamage(card, 3));
    }
  }
};
