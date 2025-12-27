import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';

export const martyrdom: SpellBlueprint = {
  id: 'martyrdom',
  name: 'Martyrdom',
  description: dedent`
  Destroy a minion and heal its owner's general for the amount of health that minion had.`,
  vfx: {
    spriteId: 'spells/f1_martyrdom',
    sequences: {
      play(game, card, ctx) {
        return {
          tracks: [
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    resourceName: 'fx_f1_martyrdom',
                    animationSequence: ['default'],
                    position: ctx.targets[0],
                    flipX: false,
                    offset: { x: 0, y: -150 },
                    scale: 1.5
                  }
                }
              ]
            },
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    resourceName: 'fx_martyrdom',
                    animationSequence: ['default'],
                    position: ctx.targets[0],
                    flipX: false,
                    offset: { x: 0, y: -25 },
                    scale: 1.5
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
    play: 'sfx_spell_martyrdom.m4a'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 2,
  runeCost: {
    blue: 1
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.MINION, {}),
  canPlay: (game, card) => singleMinionTargetRules.canPlay(game, card),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      getAoe(selectedSpaces) {
        return card.getAOE(selectedSpaces);
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    const amounttoHeal = target.remainingHp;
    await target.destroy(card);

    await target.player.general.heal(card, amounttoHeal);
  }
};
