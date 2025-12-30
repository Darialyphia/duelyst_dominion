import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnDestroyModifier } from '../../../../modifier/modifiers/on-destroy.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const voidHunter: MinionBlueprint = {
  id: 'void-hunter',
  name: 'Void Hunter',
  description: '@Dying Wish@ : Draw 2 cards..',
  vfx: {
    spriteId: 'minions/neutral_void-hunter',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_voidpulse',
    walk: 'sfx_neutral_chaoselemental_hit',
    attack: 'sfx_neutral_voidhunter_attack_swing',
    takeDamage: 'sfx_neutral_voidhunter_hit',
    dealDamage: 'sfx_neutral_voidhunter_attack_impact',
    death: 'sfx_neutral_voidhunter_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 3,
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
