import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class ZealModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    { isInherent, mixins }: { mixins: ModifierMixin<Unit>[]; isInherent?: boolean }
  ) {
    super(KEYWORDS.ZEAL.id, game, source, {
      isInherent,
      mixins: [...mixins, new TogglableModifierMixin(game, () => this.isZealed)]
    });
  }

  get isZealed() {
    return this.target.position.isNearby(this.target.player.general);
  }
}
