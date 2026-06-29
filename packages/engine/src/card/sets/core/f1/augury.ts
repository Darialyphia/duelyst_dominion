import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, isSpell } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { PlayerInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import dedent from 'dedent';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { discover } from '../../../card-actions-utils';

export const augury: SpellBlueprint = {
  id: ' augury',
  name: 'Augury',
  description: dedent /*html*/ `Whenever you consume a rune this turn, <rt-keyword>Discover</rt-keyword> a Spell from your deck.`,
  vfx: { spriteId: 'spells/f1_augury' },
  sounds: { play: 'sfx_spell_divineblood' },
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 1,
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
    await card.player.modifiers.add(
      new Modifier('augury', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.PLAYER_AFTER_RUNE_CHANGE,
            filter(event) {
              return (
                !!event?.data.player.equals(card.player) &&
                event.data.lostRunes.length > 0
              );
            },
            async handler() {
              const choicePool = card.player.cardManager.deck.cards.filter(isSpell);
              await discover(game, card, choicePool);
            }
          }),
          new UntilEndOfTurnModifierMixin(game)
        ]
      })
    );
  }
};
