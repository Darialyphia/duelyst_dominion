import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { anywhere } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { CelerityUnitModifier } from '../../../../modifier/modifiers/celerity.modifier';
import { PlayerArtifact } from '../../../../player/player-artifact.entity';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';

export const scionsCrown: ArtifactBlueprint = {
  id: 'scions-crown',
  name: "Scion's Crown",
  description: dedent`
  Your general has @Celerity@ and cannot damage generals.
  `,
  sprite: { id: 'artifacts/f3_scions-crown' },
  sounds: {},
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 3,
  durability: 3,
  runeCost: {},
  getAoe: (game, card) =>
    new PointAOEShape(TARGETING_TYPE.ALLY_GENERAL, {
      override: card.player.general
    }),
  canPlay: () => true,
  getTargets: anywhere.getPreResponseTargets({ min: 1, max: 1, allowRepeat: false }),
  async onInit() {},
  async onPlay(game, card, { artifact }) {
    const MODIFIER_ID = 'scions-crown-aura';

    const aura = new CelerityUnitModifier(game, card, {
      modifierType: MODIFIER_ID,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'damageDealt',
          interceptor: (value, { target }) => (target.isGeneral ? 0 : value)
        })
      ]
    });

    await artifact.modifiers.add(
      new Modifier<PlayerArtifact>('scions-crown', game, card, {
        mixins: [
          new UnitAuraModifierMixin(game, {
            isElligible(candidate) {
              return candidate.equals(card.player.general);
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(aura);
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(MODIFIER_ID);
            }
          })
        ]
      })
    );
  }
};
