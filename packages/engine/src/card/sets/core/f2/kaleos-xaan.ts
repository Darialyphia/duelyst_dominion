import dedent from 'dedent';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import { BackstabModifier } from '../../../../modifier/modifiers/backstab.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { UniqueModifier } from '../../../../modifier/modifiers/unique.modifier';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';

export const kaleosXaan: MinionBlueprint = {
  id: 'kaleos-xaan',
  name: 'Kaleos Xaan',
  description: dedent /*html*/ `
  <rt-keyword>Unique</rt-keyword> <rt-keyword>Backstab 2</rt-keyword>.
  <rt-runes runes="wisdom,focus"></rt-runes> <rt-trigger>On Enter</rt-trigger> Deal 1 damage to enemy minions.
  `,
  vfx: {
    spriteId: 'generals/f2_kaleos-xaan'
  },
  sounds: {
    play: 'sfx_unit_deploy_1',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f2general_attack_swing',
    takeDamage: 'sfx_f2general_hit_2',
    dealDamage: 'sfx_f2general_attack_impact_3',
    death: 'sfx_f2general_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.LEGENDARY,
  tags: [TAGS.GENERAL],
  manaCost: 5,
  atk: 3,
  maxHp: 4,
  retaliation: 1,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new UniqueModifier(game, card));

    await card.modifiers.add(
      new BackstabModifier(game, card, {
        damageBonus: 1
      })
    );

    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, {
        timing: 'after',
        handler: async () => {
          for (const minion of card.player.enemyUnits) {
            await minion.takeDamage(card, new AbilityDamage(card, 1));
          }
        }
      })
    );
  },
  async onPlay() {}
};
