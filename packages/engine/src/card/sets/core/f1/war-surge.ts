import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { EverywhereAOEShape } from '../../../../aoe/everywhere.aoe-shape';
import dedent from 'dedent';
import { RUNES } from '../../../../player/player.enums';
import { UnitSimpleRetaliationBuffModifier } from '../../../../modifier/modifiers/simple-retaliation-buff.modifier';

export const warSurge: SpellBlueprint = {
  id: 'war-surge',
  name: 'War Surge',
  description: dedent /*html*/ `Consume <rt-runes runes="might"></rt-runes> to give allied minions +1/+1/+1.`,
  vfx: {
    spriteId: 'spells/f1_war-surge',
    sequences: {
      play() {
        return {
          tracks: [
            {
              steps: [
                {
                  type: 'playSpriteOnScreenCenter',
                  params: {
                    resourceName: 'fx_f1_warsurge',
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
    play: 'sfx_spell_warsurge'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  getAoe: game =>
    new EverywhereAOEShape(TARGETING_TYPE.ALLY_UNIT, {
      width: game.boardSystem.map.cols,
      height: game.boardSystem.map.rows
    }),
  canPlay: (game, card) => card.player.runeManager.has({ might: 1 }),
  getTargets(game, card) {
    return anywhereTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, {
      getAoe: () =>
        new EverywhereAOEShape(TARGETING_TYPE.ALLY_UNIT, {
          width: game.boardSystem.map.cols,
          height: game.boardSystem.map.rows
        })
    });
  },
  async onInit() {},
  async onPlay(game, card, { targets, aoe }) {
    await card.player.runeManager.remove([RUNES.MIGHT]);
    const unitsToBuff = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of unitsToBuff) {
      await unit.modifiers.add(
        new UnitSimpleAttackBuffModifier('war-surge-atk-buff', game, card, {
          amount: 1
        })
      );
      await unit.modifiers.add(
        new UnitSimpleRetaliationBuffModifier('war-surge-ret-buff', game, card, {
          amount: 1
        })
      );
      await unit.modifiers.add(
        new UnitSimpleHealthBuffModifier('war-surge-hp-buff', game, card, {
          amount: 1
        })
      );
    }
  }
};
