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

export class UnitSimpleRetaliationBuffModifier<T extends Unit> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number;
      name?: string;
      mixins?: ModifierMixin<T>[];
      isRemovable?: boolean;
    }
  ) {
    super(modifierType, game, card, {
      icon:
        options.amount > 0
          ? 'icons/keyword-retaliation-buff'
          : 'icons/keyword-retaliation-debuff',
      name:
        options.name ?? (options.amount > 0 ? 'Retaliation Buff' : 'Retaliation Debuff'),
      description: `${options.amount > 0 ? '+' : '-'}${options.amount} Retaliation`,
      isUnique: true,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'retaliation',
          interceptor: value => {
            return value + options.amount * this.stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}

export class MinionSimpleRetaliationBuffModifier<
  T extends MinionCard
> extends Modifier<T> {
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
      icon:
        options.amount > 0
          ? 'icons/keyword-retaliation-buff'
          : 'icons/keyword-retaliation-debuff',
      name:
        options.name ?? (options.amount > 0 ? 'Retaliation Buff' : 'Retaliation Debuff'),
      description: `${options.amount > 0 ? '+' : '-'}${options.amount} Retaliation`,
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'retaliation',
          interceptor: value => {
            return value + options.amount * this.stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
