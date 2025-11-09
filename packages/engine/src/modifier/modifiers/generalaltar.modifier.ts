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
          interceptor: () => false,
          priority: 999
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canCounterAttack',
          interceptor: () => {
            return false;
          },
          priority: 999
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: () => {
            return false;
          },
          priority: 999
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor: () => {
            return false;
          },
          priority: 999
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeAttackTarget',
          interceptor: () => {
            return false;
          },
          priority: 999
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCardTarget',
          interceptor: () => {
            return false;
          },
          priority: 999
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'damageReceived',
          interceptor: () => {
            return 0;
          },
          priority: 999
        })
      ]
    });
  }
}
