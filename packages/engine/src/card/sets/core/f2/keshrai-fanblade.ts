import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { isSpell } from '../../../card-utils';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { DurationModifierMixin } from '../../../../modifier/mixins/duration.mixin';

export const keshraiFanblade: MinionBlueprint = {
  id: 'keshrai_fanblade',
  name: 'Keshrai Fanblade',
  description: "@On Enter@: Your opponent's spells cost 1 more until your next turn.",
  vfx: {
    spriteId: 'minions/f2_keshrai-fanblade'
  },
  sounds: {},
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 5,
  runeCost: {},
  atk: 5,
  maxHp: 4,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        const enemySpells = game.cardSystem.cards.filter(
          c => isSpell(c) && c.player.equals(card.player.opponent)
        );

        for (const spell of enemySpells) {
          await spell.modifiers.add(
            new SimpleManacostModifier('keshrai-fanblade-manacost', game, spell, {
              amount: 1,
              mixins: [
                new TogglableModifierMixin(game, () => card.location === 'hand'),
                new DurationModifierMixin(game, 2)
              ]
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
