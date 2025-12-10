import { RingAOEShape } from '../../../../aoe/ring.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const frostboneNaga: MinionBlueprint = {
  id: 'frostbone-naga',
  name: 'Frostbone Naga',
  description: '@On Enter@: Deal 2 damage to nearby units.',
  vfx: { spriteId: 'minions/neutral_frostbone-naga' },
  sounds: {
    play: 'sfx_unit_deploy_2.m4a',
    walk: 'sfx_neutral_ladylocke_attack_impact.m4a',
    attack: 'sfx_f4_siren_attack_swing.m4a',
    takeDamage: 'sfx_f4_siren_hit.m4a',
    dealDamage: 'sfx_f6_ancientgrove_attack_impact.m4a',
    death: 'sfx_f4_siren_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 4,
  runeCost: {
    red: 2
  },
  atk: 3,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new RingAOEShape(TARGETING_TYPE.UNIT, { size: 1 }),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async event => {
        const unitsToDamage = game.unitSystem.getUnitsInAOE(
          event.data.aoe,
          [event.data.cell.position],
          card.player
        );

        for (const unit of unitsToDamage) {
          await unit.takeDamage(card, new AbilityDamage(card, 2));
        }
      })
    );
  },
  async onPlay() {}
};
