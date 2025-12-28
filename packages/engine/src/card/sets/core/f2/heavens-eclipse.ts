import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, isSpell } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { lightOverlay } from '../../../card-vfx-sequences';

export const heavensEclipse: SpellBlueprint = {
  id: 'heavens-eclipse',
  name: "Heaven's Eclipse",
  description: 'Draw 3 spells.',
  vfx: {
    spriteId: 'spells/f2_heavens-eclipse',
    sequences: {
      play(game) {
        return {
          tracks: [
            lightOverlay(game, {
              color: '#ff003c'
            }),
            {
              steps: [
                {
                  type: 'playSpriteOnScreenCenter',
                  params: {
                    resourceName: 'fx_f2_heavenseclipse',
                    animationSequence: ['default'],
                    scale: 1.5,
                    flipX: false,
                    offset: { x: 0, y: 0 }
                  }
                }
              ]
            }
          ]
        };
      }
    }
  },
  sounds: {},
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 4,
  runeCost: {
    red: 2,
    yellow: 1
  },
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  getTargets(game, card) {
    return anywhereTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, {
      getAoe: targets => card.getAOE(targets)
    });
  },
  async onInit() {},
  async onPlay(game, card) {
    await card.player.cardManager.drawFromPool(
      card.player.cardManager.deck.cards.filter(isSpell),
      3
    );
  }
};
