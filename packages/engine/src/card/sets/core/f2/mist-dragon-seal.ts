import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { emptySpacesTargetRules, singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';

export const mistDragonSeal: SpellBlueprint = {
  id: 'mist-dragon-seal',
  name: 'Mist Dragon Seal',
  description: 'Give an allied minion +1/+1 and teleport it to any space..',
  vfx: {
    spriteId: 'spells/f2_mist-dragon-seal',
    sequences: {
      play(game, card, ctx) {
        return {
          tracks: [
            {
              steps: [
                {
                  type: 'playSpriteOnScreenCenter',
                  params: {
                    resourceName: 'fx_blueplasma_vertical',
                    animationSequence: ['default'],
                    scale: 1.5,
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
                    resourceName: 'fx_f2_mistdragonseal',
                    animationSequence: ['default'],
                    position: ctx.targets[0],
                    scale: 1.5,
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
                    resourceName: 'fx_explosionblueelectrical',
                    animationSequence: ['default'],
                    position: ctx.targets[0],
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
    play: 'sfx_spell_phoenixfire'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.BASIC,
  tags: [],
  manaCost: 2,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_UNIT, {}),
  canPlay: (game, card) => {
    const first = singleMinionTargetRules.canPlay(game, card, c => c.isAlly(card.player));
    const second = emptySpacesTargetRules.canPlay({ min: 1 })(game, () => true);
    return first && second;
  },
  async getTargets(game, card) {
    const first = await singleMinionTargetRules.getPreResponseTargets(game, card, {
      predicate: () => true,
      getAoe(selectedSpaces) {
        return card.getAOE(selectedSpaces);
      }
    });
    const second = await emptySpacesTargetRules.getPreResponseTargets({ min: 1, max: 1 })(
      game,
      card,
      {
        predicate: () => true,
        getAoe(selectedSpaces) {
          return card.getAOE(selectedSpaces);
        },
        getLabel() {
          return `${card.blueprint.name} : Select the space to teleport to`;
        }
      }
    );

    return [...first, ...second];
  },
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    const destination = game.boardSystem.getCellAt(targets[1]);
    if (!destination) return;
    if (destination.isOccupied) return;

    await target.modifiers.add(
      new UnitSimpleAttackBuffModifier('mist-dragon-seal-attack-buff', game, card, {
        amount: 1
      })
    );

    await target.modifiers.add(
      new UnitSimpleHealthBuffModifier('mist-dragon-seal-hp-buff', game, card, {
        amount: 1
      })
    );

    await target.teleport(destination);
  }
};
