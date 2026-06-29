import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleUnitTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';

export const sundropElixir: SpellBlueprint = {
  id: 'sundrop-elixir',
  name: 'Sundrop Elixir',
  description: dedent /*html*/ `
    Heal a unit for 2.
    <rt-runes runes="focus,focus,resonance"></rt-runes>Fully heal it instead.
  `,
  vfx: {
    spriteId: 'spells/f1_sundrop-elixir',
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
                    resourceName: 'fx_buff',
                    scale: 1.5,
                    animationSequence: ['default'],
                    flipX: false,
                    offset: { x: 0, y: 0 }
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
                    resourceName: 'impact',
                    scale: 1.5,
                    animationSequence: ['impactorangebig'],
                    flipX: false,
                    offset: { x: 0, y: -40 }
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
    play: 'sfx_spell_lionheartblessing'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 0,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.UNIT, {}),
  canPlay: (game, card) => singleUnitTargetRules.canPlay(game, card),
  getTargets(game, card) {
    return singleUnitTargetRules.getPreResponseTargets(game, card, {
      getAoe(spaces) {
        return card.getAOE(spaces);
      }
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    const healAmount = card.player.runeManager.has({ focus: 2, resonance: 1 })
      ? target.maxHp
      : 2;
    await target.heal(card, healAmount);
  }
};
