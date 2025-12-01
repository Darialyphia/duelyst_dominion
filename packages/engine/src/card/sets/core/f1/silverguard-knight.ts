import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { ProvokeModifier } from '../../../../modifier/modifiers/provoke.modifier';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const silverguardKnight: MinionBlueprint = {
  id: 'silverguard_knight',
  name: 'Silverguard Knight',
  description: dedent`
  @Provoke@.
  @Zeal@ : +2 Attack.
  `,
  sprite: {
    id: 'minions/f1_silverguard-knight'
  },
  sounds: {},
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 3,
  runeCost: {
    red: 1
  },
  atk: 1,
  speed: 1,
  maxHp: 5,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ProvokeModifier(game, card));
    await card.modifiers.add(
      new ZealModifier('silverguard-knight-zeal', game, card, {
        mixins: [
          new UnitInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor: value => value + 2
          })
        ]
      })
    );
  },
  async onPlay() {}
};
