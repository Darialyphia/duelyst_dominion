import { KEYWORDS } from '../../card/card-keywords';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
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
        new MinionInterceptorModifierMixin(game, {
          key: 'hasSummoningSickness',
          interceptor: () => false
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
