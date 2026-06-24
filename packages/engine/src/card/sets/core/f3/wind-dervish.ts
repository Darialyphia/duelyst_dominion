import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { EphemeralCardModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';

export const windDervish: MinionBlueprint = {
  id: 'wind-dervish',
  name: 'Wind Dervish',
  description: dedent /*html*/ `
  <rt-keyword>Rush</rt-keyword>, <rt-keyword>Ephemeral</rt-keyword>.
  `,
  vfx: { spriteId: 'minions/f3_wind-dervish' },
  sounds: {
    play: 'sfx_spell_ghostlightning',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_komodocharger_attack_swing',
    takeDamage: 'sfx_neutral_komodocharger_hit',
    dealDamage: 'sfx_neutral_komodocharger_attack_impact',
    death: 'sfx_neutral_komodocharger_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: false,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.TOKEN,
  tags: [TAGS.DERVISH],
  manaCost: 2,
  atk: 2,
  maxHp: 2,
  retaliation: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card));
    await card.modifiers.add(new EphemeralCardModifier(game, card));
  },
  async onPlay() {}
};
