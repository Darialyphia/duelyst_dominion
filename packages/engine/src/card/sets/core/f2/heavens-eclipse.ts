import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, isSpell } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { EverywhereAOEShape } from '../../../../aoe/everywhere.aoe-shape';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';

export const heavensEclipse: SpellBlueprint = {
  id: 'heavens-eclipse',
  name: "Heaven's Eclipse",
  description: 'Draw 3 spells.',
  sprite: { id: 'spells/f2_heavens-eclipse' },
  sounds: {},
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 4,
  runeCost: {
    red: 2,
    yellow: 1
  },
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
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
  async onPlay(game, card) {
    await card.player.cardManager.drawFromPool(
      card.player.cardManager.deck.cards.filter(isSpell),
      3
    );
  }
};
