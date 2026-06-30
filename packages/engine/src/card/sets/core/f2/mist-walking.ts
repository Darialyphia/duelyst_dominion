import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleUnitTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { ElusiveUnitModifier } from '../../../../modifier/modifiers/elusive.modifier';
import dedent from 'dedent';
import { CelerityUnitModifier } from '../../../../modifier/modifiers/celerity.modifier';
import { BurstModifier } from '../../../../modifier/modifiers/burst.modifier';
import { RuneCostToggleModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const mistWalking: SpellBlueprint = {
  id: 'mist-walking',
  name: 'Mist Walking',
  description: dedent /*html*/ `
  Give a unit <rt-keyword>Celerity</rt-keyword> and <rt-keyword>Elusive</rt-keyword>
  <rt-runes runes="might,focus"></rt-runes> <rt-keyword>Burst</rt-keyword>
  `,
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
  async onInit(game, card) {
    await card.modifiers.add(
      new BurstModifier(game, card, {
        mixins: [new RuneCostToggleModifierMixin(game, card, { might: 1, focus: 1 })]
      })
    );
  },
  async onPlay(game, card, { targets }) {
    await targets[0].unit?.modifiers.add(new ElusiveUnitModifier(game, card, {}));
    await targets[0].unit?.modifiers.add(new CelerityUnitModifier(game, card, {}));
  }
};
