import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { EchoModifier } from '../../../../modifier/modifiers/echo.modifier';
import { RuneCostToggleModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { BurstModifier } from '../../../../modifier/modifiers/burst.modifier';

export const gotatsu: SpellBlueprint = {
  id: 'gotatsu',
  name: 'Gotatsu',
  description: dedent /*html*/ `
  Deal 1 damage to a minion. Draw a card.
  <rt-runes runes="wisdom,focus"></rt-runes> <rt-keyword>Echo</rt-keyword>
  <br/>
  <rt-runes runes="resonance,resonance"></rt-runes> <rt-keyword>Burst</rt-keyword>
  `,
  vfx: {
    spriteId: 'spells/f2_gotatsu',
    sequences: {
      play(game, card, options) {
        return {
          tracks: []
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
  manaCost: 1,
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  canPlay: (game, card) =>
    singleEnemyTargetRules.canPlay(game, card, c => c.isEnemy(card.player) && c.isMinion),
  getTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, {
      predicate: c => c.isEnemy(card.player) && c.isMinion,
      getAoe() {
        return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {});
      }
    });
  },
  async onInit(game, card) {
    await card.modifiers.add(
      new EchoModifier(game, card, {
        mixins: [new RuneCostToggleModifierMixin(game, card, { wisdom: 1, focus: 1 })]
      })
    );

    await card.modifiers.add(
      new BurstModifier(game, card, {
        mixins: [new RuneCostToggleModifierMixin(game, card, { resonance: 2 })]
      })
    );
  },
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(card, 1));
    await card.player.cardManager.drawFromDeck(1);
  }
};
