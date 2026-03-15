import dedent from 'dedent';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import type { MinionBlueprint } from '../../../card-blueprint';
import { UniqueModifier } from '../../../../modifier/modifiers/unique.modifier';
import { BlastCardModifier } from '../../../../modifier/modifiers/blast.modifier';
import { windDervish } from './wind-dervish';
import { MinionSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';

export const zirixStarstrider: MinionBlueprint = {
  id: 'zirix-starstrider',
  name: 'Zirix Starstrider',
  description: dedent`
  @Unique@, @Blast@.
  This has +X attack, where X is the number of @${windDervish.name}@ you control.
  `,
  vfx: {
    spriteId: 'generals/f3_zirix-starstrider'
  },
  sounds: {
    play: 'sfx_spell_ghostlightning',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f3_general_attack_swing',
    takeDamage: 'sfx_f3_general_hit',
    dealDamage: 'sfx_f3_general_attack_impact',
    death: 'sfx_neutral_swornavenger_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.LEGENDARY,
  tags: [TAGS.GENERAL],
  manaCost: 4,
  runeCost: {},
  atk: 2,
  maxHp: 5,
  retaliation: 2,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new UniqueModifier(game, card));
    await card.modifiers.add(new BlastCardModifier(game, card));

    await card.modifiers.add(
      new MinionSimpleAttackBuffModifier('zirix-starstrider-attack-buff', game, card, {
        amount() {
          return card.player.units.filter(
            unit => unit.card.blueprintId === windDervish.id
          ).length;
        }
      })
    );
  },
  async onPlay() {}
};
