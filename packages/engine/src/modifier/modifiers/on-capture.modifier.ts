import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { ShrineCaptureEvent } from '../../board/entities/shrine.entity';

export class MinionOnCaptureModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    handler: (event: ShrineCaptureEvent) => MaybePromise<void>
  ) {
    super(KEYWORDS.ON_CAPTURE.id, game, source, {
      name: KEYWORDS.ON_CAPTURE.name,
      description: KEYWORDS.ON_CAPTURE.description,
      icon: 'icons/keywords/on-capture.png',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_CAPTURE),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.SHRINE_AFTER_CAPTURE,
          handler: event => {
            if (event.data.unit.equals(this.target.unit)) {
              return handler(event);
            }
          }
        })
      ]
    });
  }
}
