import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { BackstabUnitModifier } from '../../../../modifier/modifiers/backstab.modifier';
import { lightOverlay } from '../../../card-vfx-sequences';
import dedent from 'dedent';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';

export const killingEdge: SpellBlueprint = {
  id: 'killing-edge',
  name: 'Killing Edge',
  description: dedent /*html*/ `
    Give an allied minion +2 / +0 / +1 and <rt-keyword>Backstab 1</rt-keyword>. 
  `,
  vfx: {
    spriteId: 'spells/f2_killing-edge',
    sequences: {
      play(game, card, ctx) {
        return {
          tracks: [
            lightOverlay(game, {
              color: '#ff003c'
            }),
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position: ctx.targets[0],
                    resourceName: 'fx_f2_killingedge',
                    animationSequence: ['default'],
                    scale: 1.5,
                    flipX: false,
                    offset: { x: 0, y: -60 }
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
                    resourceName: 'fx_firetornado',
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
  sounds: {
    play: 'sfx_spell_twinstrike'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 3,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_UNIT, {}),
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.isAlly(card.player)),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isAlly(card.player),
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.ALLY_UNIT, {});
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.modifiers.add(
      new UnitSimpleAttackBuffModifier('killing-edge-attack-buff', game, card, {
        name: 'Killing Edge Attack Buff',
        amount: 2
      })
    );

    await target.modifiers.add(
      new UnitSimpleHealthBuffModifier('killing-edge-health-buff', game, card, {
        name: 'Killing Edge Health Buff',
        amount: 1
      })
    );

    await target.modifiers.add(new BackstabUnitModifier(game, card, { damageBonus: 1 }));
  }
};
