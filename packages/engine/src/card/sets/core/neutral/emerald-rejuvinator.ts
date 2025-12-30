import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const emeraldRejuvinator: MinionBlueprint = {
  id: 'emerald-rejuvinator',
  name: 'Emerald Rejuvinator',
  description: '@On Enter@: Heal your general for 4.',
  vfx: {
    spriteId: 'minions/neutral_emerald-rejuvinator',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_immolation_b',
    walk: 'sfx_unit_run_charge_4',
    attack: 'sfx_neutral_emeraldrejuvinator_attack_swing',
    takeDamage: 'sfx_f1_silvermanevanguard_hit',
    dealDamage: 'sfx_f1_silvermanevanguard_attack_impact',
    death: 'sfx_neutral_emeraldrejuvinator_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 4,
  atk: 4,
  maxHp: 4,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        await card.player.general.heal(card, 4);
      })
    );
  },
  async onPlay() {}
};
