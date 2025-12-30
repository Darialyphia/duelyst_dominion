import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { BackstabUnitModifier } from '../../../../modifier/modifiers/backstab.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { lightOverlay } from '../../../card-vfx-sequences';

export const killingEdge: SpellBlueprint = {
  id: 'killing-edge',
  name: 'Killing Edge',
  description:
    'Give an allied minion +1/+1. If it has @Backstab@, draw a card at the end of the turn.',
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
  rarity: RARITIES.BASIC,
  tags: [],
  manaCost: 3,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.isAlly(card.player)),
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isAlly(card.player),
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {});
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
        amount: 4
      })
    );

    await target.modifiers.add(
      new UnitSimpleHealthBuffModifier('killing-edge-hp-buff', game, card, {
        name: 'Killing Edge Health Buff',
        amount: 2
      })
    );

    if (target.modifiers.has(BackstabUnitModifier)) {
      game.once(GAME_EVENTS.PLAYER_END_TURN, async () => {
        await card.player.cardManager.drawFromDeck(1);
      });
    }
  }
};
