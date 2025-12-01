import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import {
  MinionInterceptorModifierMixin,
  UnitInterceptorModifierMixin
} from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class UnitSimplespeedBuffModifier<T extends Unit> extends Modifier<T> {
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
      icon: options.amount > 0 ? 'keyword-speed-buff' : 'keyword-speed-debuff',
      name:
        (options.name ?? options.amount > 0) ? 'Commandment Buff' : 'Commandment Debuff',
      description: `${options.amount > 0 ? '+' : '-'}${options.amount} Commandment`,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'speed',
          interceptor: value => {
            return value + options.amount * this.stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}

export class MinionSimplespeedBuffModifier<T extends MinionCard> extends Modifier<T> {
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
      icon: options.amount > 0 ? 'keyword-speed-buff' : 'keyword-speed-debuff',
      name:
        (options.name ?? options.amount > 0) ? 'Commandment Buff' : 'Commandment Debuff',
      description: `${options.amount > 0 ? '+' : '-'}${options.amount} Commandment`,
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'speed',
          interceptor: value => {
            return value + options.amount * this.stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
