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
  sprite: { id: 'minions/neutral_frostbone-naga' },
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
  cmd: 1,
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
