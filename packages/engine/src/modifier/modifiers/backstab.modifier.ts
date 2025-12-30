import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Interceptable } from '../../utils/interceptable';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { UNIT_EVENTS } from '../../unit/unit.enums';
import { UnitEffectTriggeredEvent } from '../../unit/unit-events';

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
          onApplied: async unit => {
            await unit.modifiers.add(
              new BackstabUnitModifier(game, source, {
                damageBonus: options.damageBonus
              })
            );
          },
          onRemoved: async unit => {
            await unit.modifiers.remove(BackstabUnitModifier);
          }
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
      icon: 'icons/keyword-on-attack',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'damageDealt',
          interceptor: (value, ctx) => {
            if (!this.target.player.isTurnPlayer) return value;
            if (!ctx.target.behind?.unit) return value;

            return value + this.backstabAmount.getValue(this.options.damageBonus, this);
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCounterattackTarget',
          interceptor: (value, ctx) =>
            ctx.attacker.behind?.unit?.equals(this.target) ? false : true
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
