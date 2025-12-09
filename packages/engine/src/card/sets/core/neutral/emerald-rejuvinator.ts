import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const emeraldRejuvinator: MinionBlueprint = {
  id: 'emerald-rejuvinator',
  name: 'Emerald Rejuvinator',
  description: '@On Enter@: Heal your general for 4.',
  sprite: { id: 'minions/neutral_emerald-rejuvinator' },
  sounds: {
    play: 'sfx_spell_immolation_b.m4a',
    walk: 'sfx_unit_run_charge_4.m4a',
    attack: 'sfx_neutral_emeraldrejuvinator_attack_swing.m4a',
    takeDamage: 'sfx_f1_silvermanevanguard_hit.m4a',
    dealDamage: 'sfx_f1_silvermanevanguard_attack_impact.m4a',
    death: 'sfx_neutral_emeraldrejuvinator_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 4,
  runeCost: {
    yellow: 1
  },
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
