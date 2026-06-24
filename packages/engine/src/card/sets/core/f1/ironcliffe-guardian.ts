import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { ProvokeModifier } from '../../../../modifier/modifiers/provoke.modifier';
import { lyonarSpawn } from '../../../card-vfx-sequences';

export const ironcliffeGuardian: MinionBlueprint = {
  id: 'ironcliffe_guardian',
  name: 'Ironcliffe Guardian',
  description: dedent /*html*/ `
  <rt-keyword>Provoke</rt-keyword>.`,
  vfx: {
    spriteId: 'minions/f1_ironcliffe-guardian',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_immolation_b',
    walk: 'sfx_unit_run_charge_4',
    attack: 'sfx_f1_ironcliffeguardian_attack_swing',
    takeDamage: 'sfx_f1_ironcliffeguardian_hit',
    dealDamage: 'sfx_f1_ironcliffeguardian_attack_impact',
    death: 'sfx_f1_ironcliffeguardian_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 5,
  atk: 2,
  maxHp: 9,
  retaliation: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new ProvokeModifier(game, card));
  },
  async onPlay() {}
};
