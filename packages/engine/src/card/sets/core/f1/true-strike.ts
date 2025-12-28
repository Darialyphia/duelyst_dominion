import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';

export const trueStrike: SpellBlueprint = {
  id: 'true-strike',
  name: 'True Strike',
  description: 'Deal 2 damage to an enemy minion.',
  vfx: {
    spriteId: 'spells/f1_true-strike',
    sequences: {
      play(game, card, ctx) {
        return {
          tracks: [
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position: ctx.targets[0],
                    resourceName: 'fx_f1_truestrike',
                    scale: 1.5,
                    animationSequence: ['default'],
                    flipX: false,
                    offset: { x: 0, y: 0 }
                  }
                },
                {
                  type: 'playSpriteAt',
                  params: {
                    position: ctx.targets[0],
                    resourceName: 'fx_energyhaloground',
                    scale: 1.5,
                    animationSequence: ['default'],
                    flipX: false,
                    offset: { x: 0, y: 40 }
                  }
                }
              ]
            }
          ]
        };
      }
    }
  },
  sounds: {
    play: 'sfx_spell_truestrike.m4a'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  manaCost: 1,
  runeCost: {
    red: 1
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_MINION, {}),
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.isEnemy(card.player)),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isEnemy(card.player),
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.ENEMY_MINION, {});
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(card, 2));
  }
};
