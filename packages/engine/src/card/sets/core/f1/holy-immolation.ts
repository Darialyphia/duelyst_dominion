import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleUnitTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import dedent from 'dedent';
import { RingAOEShape } from '../../../../aoe/ring.aoe-shape';
import { lightOverlay } from '../../../card-vfx-sequences';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { SpellDamage } from '../../../../utils/damage';

export const holyImmolation: SpellBlueprint = {
  id: 'holy-immolation',
  name: 'Holy Immolation',
  description: dedent`
  Deal 4 damage to an enemy. Inflict @Burn (2) on adjacent enemies. Heal adjacent allies for 4.`,
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
    play: 'sfx_f2_jadeogre_attack_impact'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.EPIC,
  tags: [],
  runeCost: {},
  manaCost: 4,
  getAoe: () =>
    new RingAOEShape(TARGETING_TYPE.ENEMY_UNIT, {
      includeDiagonals: false,
      includeCenter: true
    }),
  canPlay: (game, card) =>
    singleUnitTargetRules.canPlay(game, card, c => c.isEnemy(card.player)),
  getTargets(game, card) {
    return singleUnitTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isEnemy(card.player),
      getAoe(spaces) {
        return card.blueprint.getAoe(game, card, spaces);
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    const units = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of units) {
      if (unit.isAlly(card.player)) {
        if (unit.position.equals(targets[0])) {
          await unit.takeDamage(card, new SpellDamage(card, 4));
        } else {
          await unit.heal(card, 4);
        }
      } else {
        await unit.modifiers.add(new BurnModifier(game, card, { stacks: 2 }));
      }
    }
  }
};
