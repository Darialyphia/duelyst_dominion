import { KEYWORDS } from '../../card/card-keywords';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class RushModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    card: MinionCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.RUSH.id, game, card, {
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_AFTER_SUMMON,
          filter: event => {
            if (!event) return false;
            return event.data.card.equals(this.target);
          },
          handler: async () => {
            this.target.unit.wakeUp();
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
