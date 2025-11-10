import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const warJudicator: MinionBlueprint = {
  id: 'war_judicator',
  name: 'War Judicator',
  description: '@Zeal@ : +2 Commandment.',
  cardIconId: 'minions/f1_war-judicator',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 3,
  runeCost: {
    red: 1,
    blue: 1
  },
  atk: 1,
  cmd: 1,
  maxHp: 5,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier('war-judicator-zeal', game, card, {
        mixins: [
          new UnitInterceptorModifierMixin(game, {
            key: 'cmd',
            interceptor: value => value + 2
          })
        ]
      })
    );
  },
  async onPlay() {}
};
