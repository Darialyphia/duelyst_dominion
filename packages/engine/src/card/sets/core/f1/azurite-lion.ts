import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { CelerityCardModifier } from '../../../../modifier/modifiers/celerity.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const azuriteLion: MinionBlueprint = {
  id: 'azurite_lion',
  name: 'Azurite Lion',
  description: '@Celerity@.',
  vfx: {
    spriteId: 'minions/f1_azurite-lion',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_diretidefrenzy',
    walk: 'sfx_neutral_arakiheadhunter_hit',
    attack: 'sfx_neutral_beastsaberspinetiger_attack_swing',
    dealDamage: 'sfx_neutral_beastsaberspinetiger_hit',
    takeDamage: 'sfx_neutral_beastsaberspinetiger_attack_impact',
    death: 'sfx_neutral_beastphasehound_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  atk: 2,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new CelerityCardModifier(game, card));
  },
  async onPlay() {}
};
