import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { isSpell } from '../../../card-utils';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import { ProvokeModifier } from '../../../../modifier/modifiers/provoke.modifier';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import dedent from 'dedent';

export const jadeMonk: MinionBlueprint = {
  id: 'jade-monk',
  name: 'Jade Monk',
  description: dedent`
  @Provoke@.
  This card costs 1 less for each spell you played this turn.`,
  vfx: {
    spriteId: 'minions/f2_jade-monk',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_deathstrikeseal',
    walk: 'sfx_unit_physical_4',
    attack: 'sfx_f2_jadeogre_attack_swing',
    takeDamage: 'sfx_f2_jadeogre_hit',
    dealDamage: 'sfx_f2_jadeogre_attack_impact',
    death: 'sfx_f2_jadeogre_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 3,
  atk: 3,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ProvokeModifier(game, card));
    await card.modifiers.add(
      new Modifier('jade-monk-discount', game, card, {
        mixins: [
          new MinionInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor: cost =>
              Math.max(
                0,
                cost - card.player.cardTracker.cardsPlayedThisTurn.filter(isSpell).length
              )
          })
        ]
      })
    );
  },
  async onPlay() {}
};
