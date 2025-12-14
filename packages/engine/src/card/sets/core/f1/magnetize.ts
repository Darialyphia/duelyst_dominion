import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { consume } from '../../../card-actions-utils';

export const magnetize: SpellBlueprint = {
  id: 'magnetize',
  name: 'Magnetize',
  description: dedent`Move an minion to the space in front of your general.`,
  vfx: { spriteId: 'spells/f1_magnetize' },
  sounds: {
    play: 'sfx_spell_naturalselection.m4a'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 1,
  runeCost: {
    blue: 1
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.MINION, {}),
  canPlay: (game, card) => {
    if (card.player.general.inFront?.isOccupied) return false;

    return singleMinionTargetRules.canPlay(game, card);
  },
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
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

    await target.teleport(card.player.general.inFront!);
  }
};
