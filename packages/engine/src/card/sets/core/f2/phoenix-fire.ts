import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { lightOverlay } from '../../../card-vfx-sequences';
import dedent from 'dedent';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { RuneCostToggleModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const phoenixFire: SpellBlueprint = {
  id: 'phoenix-fire',
  name: 'Phoenix Fire',
  description: dedent /*html*/ `
  Deal 3 damage to an enemy.
  <rt-runes runes="might,might"></rt-runes> Deal 1 damage to nearby enemies.
  <rt-runes runes="wisdom,resonance"></rt-runes> this costs 1 less
  `,
  vfx: {
    spriteId: 'spells/f2_phoenix-fire',
    sequences: {
      play(game, card, options) {
        return {
          tracks: [
            lightOverlay(game, { color: '#ff003c' }),
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position: options.targets[0],
                    resourceName: 'fx_f2_phoenixfire',
                    animationSequence: ['default'],
                    scale: 1.5,
                    flipX: false,
                    offset: { x: 0, y: -50 }
                  }
                }
              ]
            },
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position: options.targets[0],
                    resourceName: 'fx_firetornado',
                    animationSequence: ['default'],
                    scale: 1.5,
                    flipX: false,
                    offset: { x: 0, y: -30 }
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
    play: 'sfx_spell_phoenixfire'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  canPlay: (game, card) =>
    singleEnemyTargetRules.canPlay(game, card, c => c.isEnemy(card.player)),
  getTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isEnemy(card.player),
      getAoe(targets) {
        return card.getAOE(targets);
      }
    });
  },
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('phoenix-fire-discount', game, card, {
        amount: -1,
        mixins: [new RuneCostToggleModifierMixin(game, card, { wisdom: 1, resonance: 1 })]
      })
    );
  },
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(card, 3));
    if (card.player.runeManager.has({ might: 2 })) {
      for (const aoeTarget of target.nearbyUnits.filter(u => u.isEnemy(card.player))) {
        await aoeTarget.takeDamage(card, new SpellDamage(card, 1));
      }
    }
  }
};
