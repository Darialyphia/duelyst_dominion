import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { EverywhereAOEShape } from '../../../../aoe/everywhere.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { forEachUnit, lightOverlay } from '../../../card-vfx-sequences';

export const tempest: SpellBlueprint = {
  id: 'tempest',
  name: 'Tempest',
  description: 'Deal 2 damage to all units.',
  vfx: {
    spriteId: 'spells/f1_tempest',
    sequences: {
      play(game, card, { targets, aoe }) {
        const targetTracks = forEachUnit({ game, aoe, targets, card }, position => {
          return [
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position,
                    resourceName: 'fx_fireslash',
                    animationSequence: ['default'],
                    offset: { x: 0, y: 0 },
                    scale: 1.5,
                    flipX: false
                  }
                }
              ]
            },
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position,
                    resourceName: 'fx_fireslash',
                    animationSequence: ['default'],
                    offset: { x: 0, y: -100 },
                    scale: 1.5,
                    flipX: true
                  }
                }
              ]
            },
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position,
                    resourceName: 'fx_heavenlystrike',
                    animationSequence: ['default'],
                    offset: { x: 0, y: -150 },
                    scale: 1.5,
                    flipX: false
                  }
                }
              ]
            }
          ];
        });

        return {
          tracks: [lightOverlay(game, { color: '#faa03c' }), ...targetTracks]
        };
      }
    }
  },
  sounds: {
    play: 'sfx_spell_heavenstrike'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  runeCost: {
    red: 2
  },
  getAoe: game =>
    new EverywhereAOEShape(TARGETING_TYPE.UNIT, {
      width: game.boardSystem.map.cols,
      height: game.boardSystem.map.rows
    }),
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
  async onPlay(game, card, { targets, aoe }) {
    const unitsToDamage = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of unitsToDamage) {
      await unit.takeDamage(card, new SpellDamage(card, 3));
    }
  }
};
