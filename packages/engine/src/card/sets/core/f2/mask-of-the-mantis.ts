import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { AbilityDamage } from '../../../../utils/damage';

export const maskOfTheMantis: ArtifactBlueprint = {
  id: 'mask-of-the-mantis',
  name: 'Mask of the Mantis',
  description: dedent`
  When your general deals damage, deal 2 damage to a minion.
  `,
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
  manaCost: 2,
  durability: 3,
  getAoe: (game, card) =>
    new PointAOEShape(TARGETING_TYPE.ALLY_GENERAL, {
      override: card.player.general
    }),
  canPlay: () => true,
  getTargets: anywhereTargetRules.getPreResponseTargets({
    min: 1,
    max: 1,
    allowRepeat: false
  }),
  async onInit() {},
  async onPlay(game, card, { artifact }) {
    await artifact.modifiers.add(
      new Modifier('mask-of-the-mantis', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.UNIT_AFTER_DEAL_DAMAGE,
            filter: event => {
              if (!event) return false;
              return event.data.unit.equals(card.player.general);
            },
            async handler() {
              const enemyMinions = card.player.enemyMinions;
              if (!enemyMinions.length) return;

              const [target] = await singleMinionTargetRules.getPreResponseTargets(
                game,
                card,
                { required: true }
              );
              if (!target) return;

              await target.unit!.takeDamage(card, new AbilityDamage(card, 2));
            }
          })
        ]
      })
    );
  }
};
