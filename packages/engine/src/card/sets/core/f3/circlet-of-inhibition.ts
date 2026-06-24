import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { isDefined } from '@game/shared';
import { singleMinionTargetRules } from '../../../card-utils';

export const circletOfInhibition: ArtifactBlueprint = {
  id: 'circlet-of-inhibition',
  name: 'Circlet of Inhibition',
  description: dedent``,
  vfx: { spriteId: 'artifacts/f3_circlet-of-inhibition' },
  sounds: {},
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 2,
  durability: 2,
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  abilities: [
    {
      id: 'circlet-of-inhibition-ability',
      description: dedent`
      Exhaust a minion with a cost less or equal to your rune count. Lose 1 durability.
      `,
      canUse: (game, card) =>
        isDefined(card.artifact) &&
        singleMinionTargetRules.canPlay(
          game,
          card,
          unit =>
            unit.isExhausted && unit.card.manaCost <= card.player.runeManager.runeCount
        ),
      getAoe: () => new PointAOEShape(TARGETING_TYPE.UNIT, {}),
      getTargets: (game, card) =>
        singleMinionTargetRules.getPreResponseTargets(game, card, {
          required: true,
          predicate(unit) {
            return (
              unit.isExhausted && unit.card.manaCost <= card.player.runeManager.runeCount
            );
          },
          getLabel() {
            return 'Select a minion to exhaust.';
          }
        }),
      getCooldown: () => 1,
      manaCost: 1,
      async onResolve(game, card, { targets }) {
        const target = targets[0];
        await target.unit?.exhaust();
        await card.artifact?.loseDurability(1);
      }
    }
  ],
  getTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay() {}
};
