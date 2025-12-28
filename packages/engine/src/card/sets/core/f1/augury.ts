import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { PlayerInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const augury: SpellBlueprint = {
  id: ' augury',
  name: 'Augury',
  description: 'Draw a card. You can replace two additional cards this turn.',
  vfx: { spriteId: 'spells/f1_augury' },
  sounds: { play: 'sfx_spell_divineblood' },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 1,
  runeCost: {
    blue: 1
  },
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  getTargets(game, card) {
    return anywhereTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, {
      getAoe: targets => card.getAOE(targets)
    });
  },
  async onInit() {},
  async onPlay(game, card) {
    await card.player.cardManager.drawFromDeck(1);

    await card.player.modifiers.add(
      new Modifier('augury', game, card, {
        mixins: [
          new PlayerInterceptorModifierMixin(game, {
            key: 'maxReplacesPerTurn',
            interceptor: val => val + 2
          }),
          new UntilEndOfTurnModifierMixin(game)
        ]
      })
    );
  }
};
