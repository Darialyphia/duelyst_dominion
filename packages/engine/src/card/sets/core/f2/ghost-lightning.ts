import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, singleEnemyTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { EverywhereAOEShape } from '../../../../aoe/everywhere.aoe-shape';

export const ghostLightning: SpellBlueprint = {
  id: 'ghost-lightning',
  name: 'Ghost Lightning',
  description: 'Deal 1 damage to all enemy minions.',
  vfx: { spriteId: 'spells/f2_ghost-lightning' },
  sounds: {
    play: 'sfx_spell_ghostlightning.m4a'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 1,
  runeCost: {
    red: 1
  },
  getAoe: game =>
    new EverywhereAOEShape(TARGETING_TYPE.ENEMY_MINION, {
      width: game.boardSystem.map.cols,
      height: game.boardSystem.map.rows
    }),
  canPlay: anywhereTargetRules.canPlay({ min: 1, max: 1 }),
  getTargets(game, card) {
    return anywhereTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, {
      getAoe: targets => card.getAOE(targets)
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    const unitsToDamage = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of unitsToDamage) {
      await unit.takeDamage(card, new SpellDamage(card, 1));
    }
  }
};
