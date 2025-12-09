import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnDestroyModifier } from '../../../../modifier/modifiers/on-destroy.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const voidHunter: MinionBlueprint = {
  id: 'void-hunter',
  name: 'Void Hunter',
  description: '@Dying Wish@ : Draw 2 cards..',
  sprite: { id: 'minions/neutral_void-hunter' },
  sounds: {
    play: 'sfx_spell_voidpulse.m4a',
    walk: 'sfx_neutral_chaoselemental_hit.m4a',
    attack: 'sfx_neutral_voidhunter_attack_swing.m4a',
    takeDamage: 'sfx_neutral_voidhunter_hit.m4a',
    dealDamage: 'sfx_neutral_voidhunter_attack_impact.m4a',
    death: 'sfx_neutral_voidhunter_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 3,
  runeCost: {
    red: 1
  },
  atk: 4,
  maxHp: 2,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnDestroyModifier(game, card, {
        async handler() {
          await card.player.cardManager.drawFromDeck(2);
        }
      })
    );
  },
  async onPlay() {}
};
