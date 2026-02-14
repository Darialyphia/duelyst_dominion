import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { emptySpacesTargetRules, singleUnitTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { isDefined } from '@game/shared';
import { ElusiveUnitModifier } from '../../../../modifier/modifiers/elusive.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const mistWalking: SpellBlueprint = {
  id: 'mist-walking',
  name: 'Mist Walking',
  description: 'Teleport your general to an empty space and give it @Elusive@ this turn.',
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
  runeCost: {},
  manaCost: 1,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_GENERAL, {}),
  canPlay: (game, card) => {
    return (
      isDefined(card.player.deployedGeneral) &&
      emptySpacesTargetRules.canPlay({ min: 1 })(game, () => true)
    );
  },
  async getTargets(game, card) {
    return emptySpacesTargetRules.getPreResponseTargets({ min: 1, max: 1 })(game, card, {
      predicate: cell => cell.player?.equals(card.player) ?? false,
      getAoe(selectedSpaces) {
        return card.getAOE(selectedSpaces);
      },
      getLabel() {
        return `${card.blueprint.name} : Select the space to teleport to`;
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = targets[0];

    await card.player.deployedGeneral?.teleport(target);
    await card.player.deployedGeneral?.modifiers.add(
      new ElusiveUnitModifier(game, card, {
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
