import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { multipleUnitsTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import dedent from 'dedent';
import { BurstModifier } from '../../../../modifier/modifiers/burst.modifier';

export const juxtaposition: SpellBlueprint = {
  id: 'juxtaposition',
  name: 'Juxtaposition',
  description: dedent`
  Swap the position of two minions.
  @Burst@.
  `,
  vfx: {
    spriteId: 'spells/f2_juxtaposition',
    sequences: {
      play(game) {
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
  rarity: RARITIES.RARE,
  tags: [],
  runeCost: {},
  manaCost: 1,
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  getTargets(game, card) {
    return multipleUnitsTargetRules.getPreResponseTargets({
      min: 2,
      max: 2,
      allowRepeat: false
    })(game, card, {
      getAoe: targets => card.getAOE(targets),
      predicate(candidate, selected) {
        if (!candidate.isMinion) return false;
        if (!selected.length) return true;
        return candidate.isAlly(selected[0]);
      }
    });
  },
  async onInit(game, card) {
    await card.modifiers.add(new BurstModifier(game, card));
  },
  async onPlay(game, card, { targets }) {
    const [unit1, unit2] = targets.map(t => t.unit!);

    await unit1.swapPositionWith(unit2);
  }
};
