import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { StealthModifier } from '../../../../modifier/modifiers/stealth.modifier';
import { MinionOnCaptureModifier } from '../../../../modifier/modifiers/on-capture.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import type { Unit } from '../../../../unit/unit.entity';

export const deathBlighter: MinionBlueprint = {
  id: 'death-blighter',
  name: 'Death Blighter',
  description: dedent`
  @Consume@: @[rune:red]@, @Stealth@.
  @On Capture@: set the health of all enemy minions to 1.
  `,
  cardIconId: 'minions/neutral_deathblighter',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 5,
  runeCost: {
    red: 3
  },
  atk: 7,
  cmd: 1,
  maxHp: 4,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new StealthModifier(game, card));

    await card.modifiers.add(
      new MinionOnCaptureModifier(game, card, {
        async handler() {
          for (const minion of card.player.opponent.minions) {
            await minion.modifiers.add(
              new Modifier<Unit>('death-blighter-set-health', game, card, {
                mixins: [
                  new UnitInterceptorModifierMixin(game, {
                    key: 'maxHp',
                    interceptor: () => 1
                  })
                ]
              })
            );
          }
        }
      })
    );
  },
  async onPlay() {}
};
