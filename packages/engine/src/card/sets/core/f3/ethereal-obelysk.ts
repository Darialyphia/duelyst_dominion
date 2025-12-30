import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import { vetruvianSpawn } from '../../../card-vfx-sequences';
import dedent from 'dedent';
import { windDervish } from './wind-dervish';
import { StructureModifier } from '../../../../modifier/modifiers/structure.modifier';
import { SpawnModifier } from '../../../../modifier/modifiers/spawn.modifier';

export const etherealObelysk: MinionBlueprint = {
  id: 'ethereal-obelysk',
  name: 'Ethereal Obelysk',
  description: dedent`
  @Structure@.
  @Spawn@: @${windDervish.name}@ (3 charges)
  `,
  vfx: {
    spriteId: 'minions/f3_ethereal_obelysk',
    sequences: {
      play(game, card, position) {
        return vetruvianSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_divineblood',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_monsterdreamoracle_attack_swing',
    takeDamage: 'sfx_neutral_monsterdreamoracle_hit',
    dealDamage: 'sfx_f1_general_attack_impact',
    death: 'sfx_neutral_golembloodshard_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.COMMON,
  tags: [TAGS.OBELYSK],
  manaCost: 2,
  atk: 0,
  maxHp: 6,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new StructureModifier(game, card, {}));
    await card.modifiers.add(
      new SpawnModifier(game, card, {
        stacks: 3,
        blueprintId: windDervish.id
      })
    );
  },
  async onPlay() {}
};
