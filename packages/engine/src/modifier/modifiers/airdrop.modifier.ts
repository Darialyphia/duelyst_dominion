import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { AirdropTargetingtrategy } from '../../targeting/airdrop-targeting-strategy';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class AirdropModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.AIRDROP.id, game, source, {
      name: KEYWORDS.AIRDROP.name,
      description: KEYWORDS.AIRDROP.description,
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'summonTargetingStrategy',
          interceptor: () => new AirdropTargetingtrategy(game, this.target)
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
