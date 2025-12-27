import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { EphemeralCardModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const windDervish: MinionBlueprint = {
  id: 'wind-dervish',
  name: 'Wind Dervish',
  description: '@Rush@, @Ephemeral@.',
  vfx: { spriteId: 'minions/f3_wind-dervish' },
  sounds: {
    play: 'sfx_spell_ghostlightning.m4a',
    walk: 'sfx_neutral_ladylocke_attack_impact.m4a',
    attack: 'sfx_neutral_komodocharger_attack_swing.m4a',
    takeDamage: 'sfx_neutral_komodocharger_hit.m4a',
    dealDamage: 'sfx_neutral_komodocharger_attack_impact.m4a',
    death: 'sfx_neutral_komodocharger_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: false,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.TOKEN,
  tags: [],
  manaCost: 2,
  runeCost: {},
  atk: 2,
  maxHp: 2,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card));
    await card.modifiers.add(new EphemeralCardModifier(game, card));
  },
  async onPlay() {}
};
