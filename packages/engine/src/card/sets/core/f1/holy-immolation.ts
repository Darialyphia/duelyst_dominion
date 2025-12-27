import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import dedent from 'dedent';
import { RingAOEShape } from '../../../../aoe/ring.aoe-shape';
import { lightOverlay } from '../../../card-vfx-sequences';

export const holyImmolation: SpellBlueprint = {
  id: 'holy-immolation',
  name: 'Holy Immolation',
  description: dedent`
  Heal an allied minion for 4 and deal 4 damage to enemies nearby it.`,
  vfx: {
    spriteId: 'spells/f1_holy-immolation',
    sequences: {
      play(game, card, ctx) {
        return {
          tracks: [
            lightOverlay(game, { color: '#faa03c', duration: 1500 }),
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position: ctx.targets[0],
                    resourceName: 'fx_heavenlystrike',
                    scale: 1.5,
                    animationSequence: ['default'],
                    flipX: false,
                    offset: { x: 0, y: -150 }
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
                    resourceName: 'fx_vortexswirl',
                    scale: 1.5,
                    animationSequence: ['default'],
                    flipX: false,
                    offset: { x: 0, y: -15 },
                    tint: '#faa03c'
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
                    resourceName: 'fx_f1_inmolation',
                    scale: 1.5,
                    animationSequence: ['default'],
                    flipX: false,
                    offset: { x: 0, y: -15 }
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
    play: 'sfx_f2_jadeogre_attack_impact.m4a'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 4,
  runeCost: {
    yellow: 2
  },
  getAoe: () => new RingAOEShape(TARGETING_TYPE.ENEMY_UNIT, { size: 1 }),
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.isAlly(card.player)),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isAlly(card.player),
      getAoe(spaces) {
        return card.blueprint.getAoe(game, card, spaces);
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    const targetToHeal = targets[0].unit;
    if (!targetToHeal) return;

    await targetToHeal.heal(card, 4);

    const unitsToDamage = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of unitsToDamage) {
      await unit.takeDamage(card, new SpellDamage(card, 4));
    }
  }
};
