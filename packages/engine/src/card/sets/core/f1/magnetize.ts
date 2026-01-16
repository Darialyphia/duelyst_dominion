import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { RectangleAOEShape } from '../../../../aoe/rectangle.aoe-shape';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { AnchoredUnitModifier } from '../../../../modifier/modifiers/anchored.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const magnetize: SpellBlueprint = {
  id: 'magnetize',
  name: 'Magnetize',
  description: dedent`Give units on the same row as your general @Anchored@ this turn.`,
  vfx: {
    spriteId: 'spells/f1_magnetize',
    sequences: {
      play(game, card, ctx) {
        return {
          tracks: [
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    resourceName: 'fx_bladestorm',
                    animationSequence: ['default'],
                    position: ctx.targets[0],
                    flipX: false,
                    offset: { x: 0, y: 0 },
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
            },
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position: ctx.targets[0],
                    resourceName: 'fx_buff',
                    scale: 1.5,
                    animationSequence: ['default'],
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
  sounds: {
    play: 'sfx_spell_naturalselection'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.RARE,
  tags: [],
  runeCost: {},
  manaCost: 1,
  getAoe: (game, card) => {
    if (!card.player.deployedGeneral) return new NoAOEShape(TARGETING_TYPE.ANYWHERE, {});
    return new RectangleAOEShape(TARGETING_TYPE.UNIT, {
      width: game.boardSystem.width,
      height: 1,
      topLeftOverride: card.player.deployedGeneral.position
    });
  },
  canPlay: () => true,
  getTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card, { aoe }) {
    if (!card.player.deployedGeneral) return;

    const units = game.unitSystem.getUnitsInAOE(
      aoe,
      [card.player.deployedGeneral.position],
      card.player
    );

    for (const unit of units) {
      await unit.modifiers.add(
        new AnchoredUnitModifier(game, card, {
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  }
};
