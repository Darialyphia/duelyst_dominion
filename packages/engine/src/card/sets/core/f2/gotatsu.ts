import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';

export const gotatsu: SpellBlueprint = {
  id: 'gotatsu',
  name: 'Gotatsu',
  description: 'Deal 1 damage to a minion. Draw a card.',
  vfx: {
    spriteId: 'spells/f2_gotatsu',
    sequences: {
      play(game, card, options) {
        return {
          tracks: []
        };
      }
    }
  },
  sounds: {
    play: 'sfx_spell_phoenixfire'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  runeCost: {},
  manaCost: 2,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  canPlay: (game, card) =>
    singleEnemyTargetRules.canPlay(game, card, c => c.isEnemy(card.player) && c.isMinion),
  getTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isEnemy(card.player) && c.isMinion,
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {});
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(card, 1));
    await card.player.cardManager.drawFromDeck(1);
  }
};
