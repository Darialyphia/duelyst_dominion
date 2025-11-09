import type { GeneralCard } from '../../card/entities/general-card.entity';
import type { Game } from '../../game/game';
import { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { Modifier } from '../modifier.entity';

export class GeneralAltarModifier extends Modifier<Unit> {
  constructor(game: Game, card: GeneralCard) {
    super('general-altar', game, card, {
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'shouldActivateOnTurnStart',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canCounterAttack',
          interceptor: () => {
            return false;
          }
        })
      ]
    });
  }
}
