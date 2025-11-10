import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const deathBlighter: MinionBlueprint = {
  id: 'death-blighter',
  name: 'Death Blighter',
  description: '@On Capture@: set the health of all enemy minions to 1.',
  cardIconId: 'minions/neutral_death-blighter',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 6,
  runeCost: {
    red: 3
  },
  atk: 5,
  cmd: 6,
  maxHp: 1,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        for (const player of game.playerSystem.players) {
          await player.general?.takeDamage(card, new AbilityDamage(card, 2));
        }
      })
    );
  },
  async onPlay() {}
};
