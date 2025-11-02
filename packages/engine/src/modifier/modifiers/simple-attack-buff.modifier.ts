import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleAttackBuffModifier<T extends Unit> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number;
      name?: string;
      mixins?: ModifierMixin<T>[];
    }
  ) {
    super(modifierType, game, card, {
      icon: options.amount > 0 ? 'keyword-attack-buff' : 'keyword-attack-debuff',
      name: (options.name ?? options.amount > 0) ? 'Attack Buff' : 'Attack Debuff',
      description: `${options.amount > 0 ? '+' : '-'}${options.amount} Attack`,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: value => {
            return value + options.amount * this.stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
