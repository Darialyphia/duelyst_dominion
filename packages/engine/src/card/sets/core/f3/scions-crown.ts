import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { CelerityUnitModifier } from '../../../../modifier/modifiers/celerity.modifier';
import { PlayerArtifact } from '../../../../player/player-artifact.entity';

export const scionsCrown: ArtifactBlueprint = {
  id: 'scions-crown',
  name: "Scion's Crown",
  description: dedent`
  Your general has @Celerity@.
  `,
  vfx: { spriteId: 'artifacts/f3_scions-crown' },
  sounds: {},
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.EPIC,
  tags: [],
  runeCost: {},
  manaCost: 1,
  durability: 3,
  getAoe: (game, card) =>
    new PointAOEShape(TARGETING_TYPE.ALLY_GENERAL, {
      override: card.player.deployedGeneral
    }),
  canPlay: () => true,
  abilities: [],
  getTargets: anywhereTargetRules.getPreResponseTargets({
    min: 1,
    max: 1,
    allowRepeat: false
  }),
  async onInit() {},
  async onPlay(game, card, { artifact }) {
    const aura = new CelerityUnitModifier(game, card, {
      isRemovable: false,
      mixins: []
    });

    await artifact.modifiers.add(
      new Modifier<PlayerArtifact>('scions-crown', game, card, {
        mixins: [
          new UnitAuraModifierMixin(game, card, {
            isElligible(candidate) {
              if (!card.player.deployedGeneral) return false;
              return candidate.equals(card.player.deployedGeneral);
            },
            getModifiers: () => [aura]
          })
        ]
      })
    );
  }
};
