import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import dedent from 'dedent';
import { AnchoredUnitModifier } from '../../../../modifier/modifiers/anchored.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { singleUnitTargetRules } from '../../../card-utils';

export const magnetize: SpellBlueprint = {
  id: 'magnetize',
  name: 'Magnetize',
  description: dedent /*html*/ `
  Move a unit from the back row to the front row of the same column if able. Give it <rt-keyword>Anchored</rt-keyword> until end of turn.
  `,
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
  manaCost: 1,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  canPlay: (game, card) =>
    singleUnitTargetRules.canPlay(
      game,
      card,
      c => c.isEnemy(card.player) && c.isMinion && c.isOnBackRow
    ),
  getTargets(game, card) {
    return singleUnitTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isEnemy(card.player) && c.isMinion && c.isOnBackRow,
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {});
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    const units = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of units) {
      if (unit.inFront?.isEmpty) {
        await unit.teleport(unit.inFront);
      }
      await unit.modifiers.add(
        new AnchoredUnitModifier(game, card, {
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  }
};
