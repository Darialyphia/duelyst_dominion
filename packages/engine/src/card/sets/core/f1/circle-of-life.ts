import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';

export const circleOfLife: SpellBlueprint = {
  id: 'circle-of-life',
  name: 'Circle of Life',
  description: 'Deal 5 damage to a minion and heal your general for 5.',
  sprite: { id: 'spells/f1_circle-of-life' },
  sounds: {
    play: 'sfx_neutral_spelljammer_attack_swing.m4a'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  manaCost: 5,
  runeCost: {
    red: 1
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.MINION, {}),
  canPlay: (game, card) => singleMinionTargetRules.canPlay(game, card),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      getAoe(targets) {
        return card.getAOE(targets);
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(card, 5));
    await card.player.general.heal(card, 5);
  }
};
