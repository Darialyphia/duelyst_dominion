import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import dedent from 'dedent';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { isDefined } from '@game/shared';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { UnitSimpleRetaliationBuffModifier } from '../../../../modifier/modifiers/simple-retaliation-buff.modifier';

export const scionsCrown: ArtifactBlueprint = {
  id: 'scions-crown',
  name: "Scion's Crown",
  description: dedent``,
  vfx: { spriteId: 'artifacts/f3_scions-crown' },
  sounds: {},
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.EPIC,
  tags: [],
  runeCost: {},
  manaCost: 2,
  durability: 2,
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  abilities: [
    {
      id: 'scions-crown-ability',
      description: dedent`Give an ally General minion +X/+X/+0 this turn, where X is your level. Lose 1 durability.`,
      canUse: (game, card) =>
        isDefined(card.artifact) &&
        singleMinionTargetRules.canPlay(
          game,
          card,
          unit => unit.isAlly(card.player) && unit.card.hasTag(TAGS.GENERAL)
        ),
      getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_UNIT, {}),
      getTargets: (game, card) =>
        singleMinionTargetRules.getPreResponseTargets(game, card, {
          required: true,
          getLabel() {
            return `Select a minion to give +${card.player.level}/+${card.player.level}/+0 this turn.`;
          },
          predicate(unit) {
            return unit.isAlly(card.player) && unit.card.hasTag(TAGS.GENERAL);
          }
        }),
      getCooldown: () => 1,
      manaCost: 2,
      async onResolve(game, card, { targets }) {
        const target = targets[0];
        await target.unit?.modifiers.add(
          new UnitSimpleAttackBuffModifier('scions-crown-attack-buff', game, card, {
            amount: card.player.level,
            mixins: [new UntilEndOfTurnModifierMixin(game)]
          })
        );
        await target.unit?.modifiers.add(
          new UnitSimpleRetaliationBuffModifier(
            'scions-crown-retaliation-buff',
            game,
            card,
            {
              amount: card.player.level,
              mixins: [new UntilEndOfTurnModifierMixin(game)]
            }
          )
        );
        await card.artifact?.loseDurability(1);
      }
    }
  ],
  getTargets: anywhereTargetRules.getPreResponseTargets({
    min: 1,
    max: 1,
    allowRepeat: false
  }),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
  async onPlay() {}
};
