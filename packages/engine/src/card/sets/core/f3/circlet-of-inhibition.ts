import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { consume } from '../../../card-actions-utils';

export const circletOfInhibition: ArtifactBlueprint = {
  id: 'circlet-of-inhibition',
  name: 'Circlet of Inhibition',
  description: dedent`
  @Timeless@.
  When an enemy attacks your general, your opponent must pay 2. If they can't, you gain 2 max mana until the end of your next turn.
  `,
  sprite: { id: 'artifacts/f3_circlet-of-inhibition' },
  sounds: {},
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 2,
  durability: 3,
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
