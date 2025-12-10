import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { ProvokeModifier } from '../../../../modifier/modifiers/provoke.modifier';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { lyonarSpawn } from '../../../card-vfx-sequences';

export const silverguardKnight: MinionBlueprint = {
  id: 'silverguard_knight',
  name: 'Silverguard Knight',
  description: dedent`
  @Provoke@.
  @Zeal@ : +2 Attack.
  `,
  vfx: {
    spriteId: 'minions/f1_silverguard-knight',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_immolation_b.m4a',
    walk: 'sfx_neutral_ladylocke_attack_impact.m4a',
    attack: 'sfx_f1_silverguardsquire_attack_swing.m4a',
    takeDamage: 'sfx_f1_silverguardsquire_hit.m4a',
    dealDamage: 'sfx_f1_silverguardsquire_attack_impact.m4a',
    death: 'sfx_f1_silverguardsquire_death.m4a'
  },
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
