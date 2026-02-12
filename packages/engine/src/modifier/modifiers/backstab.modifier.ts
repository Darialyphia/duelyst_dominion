import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Interceptable } from '../../utils/interceptable';
import { ZealUnitModifier } from './zeal.modifier';

export class BackstabModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[]; damageBonus: number }
  ) {
    super(KEYWORDS.BACKSTAB.id, game, source, {
      name: KEYWORDS.BACKSTAB.name,
      description: KEYWORDS.BACKSTAB.description,
      icon: 'icons/keyword-on-attack',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BACKSTAB),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new BackstabUnitModifier(game, source, {
              damageBonus: options.damageBonus
            })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class BackstabUnitModifier extends Modifier<Unit> {
  private backstabAmount = new Interceptable<number, BackstabUnitModifier>();

  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      damageBonus: number;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.BACKSTAB.id, game, source, {
      name: KEYWORDS.BACKSTAB.name,
      description: KEYWORDS.BACKSTAB.description,
      icon: 'icons/keyword-backstab',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'damageDealt',
          interceptor: (value, ctx) => {
            if (!this.target.player.isTurnPlayer) return value;
            // if (!ctx.target.behind?.unit) return value;

            return value + this.backstabAmount.getValue(this.options.damageBonus, this);
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCounterattackTarget',
          interceptor: (value, ctx) => false
        }),
        ...(options.mixins ?? [])
      ]
    });
  }

  addBackstabAmountInterceptor(interceptor: (value: number) => number) {
    this.backstabAmount.add(interceptor);
    return () => this.removeBackstabAmountInterceptor(interceptor);
  }

  removeBackstabAmountInterceptor(interceptor: (value: number) => number) {
    this.backstabAmount.remove(interceptor);
  }
}

export class BackstabAmountModifierMixin extends ModifierMixin<Unit> {
  constructor(
    game: Game,
    private readonly interceptor: (value: number) => number
  ) {
    super(game);
  }

  onApplied(target: Unit): void {
    const backstabModifier = target.modifiers.get(BackstabUnitModifier);
    if (backstabModifier) {
      backstabModifier.addBackstabAmountInterceptor(this.interceptor);
    }
  }

  onRemoved(target: Unit): void {
    const backstabModifier = target.modifiers.get(BackstabUnitModifier);
    if (backstabModifier) {
      backstabModifier.removeBackstabAmountInterceptor(this.interceptor);
    }
  }

  onReapplied(): void {}
}
