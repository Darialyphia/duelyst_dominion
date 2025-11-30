import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';

export const divineBond: SpellBlueprint = {
  id: 'divine-bond',
  name: 'Divine Bond',
  description: dedent`
  Set an allied minion's attack equal to its health.
  `,
  sprite: { id: 'spells/f1_divine-bond' },
  sounds: {},
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 2,
  runeCost: {
    yellow: 1,
    blue: 1
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.isEnemy(card.player)),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isAlly(card.player),
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {});
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    const currentHp = target.remainingHp;
    await target.modifiers.add(
      new Modifier('divine-bond-atk-buff', game, card, {
        mixins: [
          new UnitInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor: () => currentHp
          })
        ]
      })
    );
  }
};
