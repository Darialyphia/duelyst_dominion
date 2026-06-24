import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleUnitTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { ElusiveUnitModifier } from '../../../../modifier/modifiers/elusive.modifier';
import dedent from 'dedent';

export const mistWalking: SpellBlueprint = {
  id: 'mist-walking',
  name: 'Mist Walking',
  description: dedent /*html*/ `Give a unit <rt-keyword>Elusive</rt-keyword>.`,
  vfx: {
    spriteId: 'spells/f2_mistwalking',
    sequences: {
      play(game, card, ctx) {
        return {
          tracks: []
        };
      }
    }
  },
  sounds: {
    play: 'sfx_neutral_crossbones_attack_swing'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 1,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.UNIT, {}),
  canPlay: (game, card) => {
    return singleUnitTargetRules.canPlay(game, card);
  },
  async getTargets(game, card) {
    return singleUnitTargetRules.getPreResponseTargets(game, card, {
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.UNIT, {});
      },
      getLabel() {
        return 'Select a unit to give <rt-keyword>Elusive</rt-keyword> to';
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    await targets[0].unit?.modifiers.add(new ElusiveUnitModifier(game, card, {}));
  }
};
