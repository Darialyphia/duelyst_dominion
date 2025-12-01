import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const windbladeAdept: MinionBlueprint = {
  id: 'windblade_adept',
  name: 'Windblade Adept',
  description: '@Zeal@ : +2 Attack.',
  sprite: {
    id: 'minions/f1_windblade-adept'
  },
  sounds: {
    play: 'sfx_spell_immolation_b.m4a',
    walk: 'sfx_neutral_ladylocke_attack_impact.m4a',
    attack: 'sfx_f2melee_attack_swing_2.m4a',
    takeDamage: 'sfx_f2melee_hit_2.m4a',
    dealDamage: 'sfx_f2melee_attack_impact_1.m4a',
    death: 'sfx_f2melee_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  runeCost: {
    red: 2
  },
  atk: 2,
  speed: 1,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier('windblade-adept-zeal', game, card, {
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
