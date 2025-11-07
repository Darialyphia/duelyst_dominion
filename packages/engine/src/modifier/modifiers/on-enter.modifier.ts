import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionSummonedEvent } from '../../card/events/minion.events';
import type { MinionCard } from '../../card/entities/minion-card.entity';

export class MinionOnEnterModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    handler: (event: MinionSummonedEvent) => MaybePromise<void>
  ) {
    super(KEYWORDS.ON_ENTER.id, game, source, {
      name: KEYWORDS.ON_ENTER.name,
      description: KEYWORDS.ON_ENTER.description,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_ENTER),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_BEFORE_SUMMON,
          handler: event => {
            if (event.data.card.equals(this.target)) {
              return handler(event);
            }
          }
        })
      ]
    });
  }
}
