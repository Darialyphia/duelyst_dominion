import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import dedent from 'dedent';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../../utils/damage';
import { isDefined } from '@game/shared';

export const maskOfTheMantis: ArtifactBlueprint = {
  id: 'mask-of-the-mantis',
  name: 'Mask of the Mantis',
  description: dedent``,
  vfx: { spriteId: 'artifacts/f2_mask-of-the-mantis' },
  sounds: {
    play: 'sfx_victory_crest'
  },
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 1,
  durability: 2,
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  abilities: [
    {
      id: 'mask-of-the-mantis-ability',
      description: dedent /*html*/ `Deal 1 damage to a minion. This loses 1 durability.`,
      canUse: (game, card) =>
        isDefined(card.artifact) && singleMinionTargetRules.canPlay(game, card),
      getAoe: () => new PointAOEShape(TARGETING_TYPE.UNIT, {}),
      getTargets: (game, card) =>
        singleMinionTargetRules.getPreResponseTargets(game, card, {
          required: true,
          getLabel() {
            return 'Select a minion to deal 1 damage to.';
          }
        }),
      getCooldown: () => 1,
      manaCost: 1,
      async onResolve(game, card, { targets }) {
        const target = targets[0];
        await target.unit?.takeDamage(card, new AbilityDamage(card, 1));
        await card.artifact?.loseDurability(1);
      }
    }
  ],
  getTargets: anywhereTargetRules.getPreResponseTargets({
    min: 1,
    max: 1,
    allowRepeat: false
  }),
  async onInit() {},
  async onPlay() {}
};
