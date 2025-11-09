import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { SubModifierMixin } from '../../../../modifier/mixins/sub-modifier.mixin';
import { ProvokeModifier } from '../../../../modifier/modifiers/provoke.modifier';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const silverguardKnight: MinionBlueprint = {
  id: 'silverguard_knight',
  name: 'Silverguard Knight',
  description: '@Zeal (2)@ : +2 Attack and @Provoke@.',
  cardIconId: 'minions/f1_silverguard-knight',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  manaCost: 3,
  runeCost: {
    red: 1
  },
  atk: 1,
  cmd: 1,
  maxHp: 5,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier('windblade-adept-zeal', game, card, {
        threshold: 2,
        mixins: [
          new UnitInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor: value => value + 2
          }),
          new SubModifierMixin(game, {
            modifier: new ProvokeModifier(game, card),
            getModifierTarget: () => card
          })
        ]
      })
    );
  },
  async onPlay() {}
};
