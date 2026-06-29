import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import dedent from 'dedent';
import { AnchoredUnitModifier } from '../../../../modifier/modifiers/anchored.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { singleEnemyTargetRules, singleUnitTargetRules } from '../../../card-utils';
import { isDefined } from '@game/shared';

export const magnetize: SpellBlueprint = {
  id: 'magnetize',
  name: 'Magnetize',
  description: dedent /*html*/ `
  Move an enemy minion in front of an ally minion and give them both <rt-keyword>Anchored</rt-keyword> this turn.
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
  canPlay: (game, card) => {
    const first = singleEnemyTargetRules.canPlay(game, card);
    const second = singleUnitTargetRules.canPlay(
      game,
      card,
      unit =>
        unit.isAlly(card.player) &&
        unit.isMinion &&
        unit.isOnFrontRow &&
        !!unit.inFront?.isEmpty
    );
    return first && second;
  },
  async getTargets(game, card) {
    const first = await singleEnemyTargetRules.getPreResponseTargets(game, card, {
      predicate: unit => unit.isAlly(card.player),
      getAoe(selectedSpaces) {
        return card.getAOE(selectedSpaces);
      }
    });

    const second = await singleUnitTargetRules.getPreResponseTargets(game, card, {
      predicate: unit =>
        unit.isAlly(card.player) &&
        unit.isMinion &&
        unit.isOnFrontRow &&
        !!unit.inFront?.isEmpty,
      getAoe(selectedSpaces) {
        return card.getAOE(selectedSpaces);
      }
    });

    return [...first, ...second];
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const spaceToTeleportTo = targets[1].inFront!;

    await targets[0].unit?.teleport(spaceToTeleportTo);

    const units = targets
      .map(t => t.unit)
      .filter(isDefined)
      .filter(u => u.isMinion);
    for (const unit of units) {
      await unit.modifiers.add(
        new AnchoredUnitModifier(game, card, {
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  }
};
