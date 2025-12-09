import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';

export const sundropElixir: SpellBlueprint = {
  id: 'sundrop-elixir',
  name: 'Sundrop Elixir',
  description: 'Heal a unit for 4.',
  sprite: { id: 'spells/f1_sundrop-elixir' },
  sounds: {
    play: 'sfx_spell_lionheartblessing.m4a'
  },
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
  getAoe: () => new PointAOEShape(TARGETING_TYPE.UNIT, {}),
  canPlay: (game, card) => singleMinionTargetRules.canPlay(game, card),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.ENEMY_MINION, {});
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.heal(card, 4);
  }
};
