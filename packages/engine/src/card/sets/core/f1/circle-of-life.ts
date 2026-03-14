import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { lightOverlay } from '../../../card-vfx-sequences';
import dedent from 'dedent';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const circleOfLife: SpellBlueprint = {
  id: 'circle-of-life',
  name: 'Circle of Life',
  description: dedent`
  Deal 5 damage to a minion and heal you for 5.
  @[lvl] 3 Bonus@: This costs @[mana] 2@ less.
  `,
  vfx: {
    spriteId: 'spells/f1_circle-of-life',
    sequences: {
      play(game, card, ctx) {
        return {
          tracks: [
            lightOverlay(game, { color: '#faa03c' }),
            {
              steps: [
                {
                  type: 'playSpriteAt',
                  params: {
                    position: ctx.targets[0],
                    resourceName: 'fx_f1_circlelife',
                    animationSequence: ['default'],
                    scale: 1.5,
                    flipX: false,
                    offset: { x: 20, y: -50 }
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
    play: 'sfx_neutral_spelljammer_attack_swing'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  runeCost: {},
  manaCost: 5,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.MINION, {}),
  canPlay: (game, card) => singleMinionTargetRules.canPlay(game, card),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      getAoe(targets) {
        return card.getAOE(targets);
      }
    });
  },
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
    const levelMod = card.modifiers.get(LevelBonusModifier)!;
    await card.modifiers.add(
      new SimpleManacostModifier('circle-of-life-mana-buff', game, card, {
        amount: -2,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );
  },
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(card, 5));
    await card.player.heal(card, 5);
  }
};
