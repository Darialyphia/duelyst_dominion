import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleUnitTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleRetaliationBuffModifier } from '../../../../modifier/modifiers/simple-retaliation-buff.modifier';

export const saberspineSeal: SpellBlueprint = {
  id: 'saberspine-seal',
  name: 'Saberspine Seal',
  description: 'Give a minion +3 Attack and +3 Retaliation this turn.',
  vfx: {
    spriteId: 'spells/f2_saberspine-seal',
    sequences: {
      play(game, card, options) {
        return {
          tracks: []
        };
      }
    }
  },
  sounds: {
    play: 'sfx_f2tank_death'
  },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.COMMON,
  tags: [],
  runeCost: {},
  manaCost: 1,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: (game, card) =>
    singleUnitTargetRules.canPlay(game, card, c => c.isAlly(card.player) && c.isMinion),
  getTargets(game, card) {
    return singleUnitTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isAlly(card.player) && c.isMinion,
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
      new UnitSimpleAttackBuffModifier('saberspine-seal-atk-buff', game, card, {
        amount: 3
      })
    );

    await target.modifiers.add(
      new UnitSimpleRetaliationBuffModifier(
        'saberspine-seal-retaliation-buff',
        game,
        card,
        {
          amount: 3
        }
      )
    );
  }
};
