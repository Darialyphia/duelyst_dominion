import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { CelerityCardModifier } from '../../../../modifier/modifiers/celerity.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const azuriteLion: MinionBlueprint = {
  id: 'azurite_lion',
  name: 'Azurite Lion',
  description: '@Celerity@.',
  sprite: { id: 'minions/f1_azurite-lion' },
  sounds: {
    play: 'sfx_spell_diretidefrenzy.m4a',
    walk: 'sfx_neutral_arakiheadhunter_hit.m4a',
    attack: 'sfx_neutral_beastsaberspinetiger_attack_swing.m4a',
    dealDamage: 'sfx_neutral_beastsaberspinetiger_hit.m4a',
    takeDamage: 'sfx_neutral_beastsaberspinetiger_attack_impact.m4a',
    death: 'sfx_neutral_beastphasehound_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  runeCost: {
    red: 1
  },
  atk: 2,
  cmd: 1,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new CelerityCardModifier(game, card));
  },
  async onPlay() {}
};
