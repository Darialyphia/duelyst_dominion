import dedent from 'dedent';
import { BackstabModifier } from '../../../../modifier/modifiers/backstab.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const kaidoAssassin: MinionBlueprint = {
  id: 'kaido_assassin',
  name: 'Kaido Assassin',
  description: dedent /*html*/ `
  <rt-keyword>Backstab 1</rt-keyword>.`,
  vfx: {
    spriteId: 'minions/f2_kaido-assasin',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_deathstrikeseal',
    walk: 'sfx_unit_run_magical_3',
    attack: 'sfx_f2_kaidoassassin_attack_swing',
    takeDamage: 'sfx_f2_kaidoassassin_hit',
    dealDamage: 'sfx_f2_kaidoassassin_attack_impact',
    death: 'sfx_f2_kaidoassassin_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  atk: 2,
  maxHp: 3,
  retaliation: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new BackstabModifier(game, card, { damageBonus: 1 }));
  },
  async onPlay() {}
};
