import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { BackstabModifier } from '../../../../modifier/modifiers/backstab.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const kaidoAssassin: MinionBlueprint = {
  id: 'kaido_assassin',
  name: 'Kaido Assassin',
  description: '@Backstab (1)@.',
  vfx: {
    spriteId: 'minions/f2_kaido-assasin',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_deathstrikeseal.m4a',
    walk: 'sfx_unit_run_magical_3.m4a',
    attack: 'sfx_f2_kaidoassassin_attack_swing.m4a',
    takeDamage: 'sfx_f2_kaidoassassin_hit.m4a',
    dealDamage: 'sfx_f2_kaidoassassin_attack_impact.m4a',
    death: 'sfx_f2_kaidoassassin_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  runeCost: {},
  atk: 2,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new BackstabModifier(game, card, { damageBonus: 1 }));
  },
  async onPlay() {}
};
