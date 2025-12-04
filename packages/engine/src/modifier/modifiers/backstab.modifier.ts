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

export class BackstabModifier extends Modifier<MinionCard> {
  private unitModifier: Modifier<Unit> | null = null;

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
            await this.applyBackstabToUnit(unit, options.damageBonus);
          },
          onRemoved: async unit => {
            if (this.unitModifier) {
              await unit.modifiers.remove(this.unitModifier);
            }
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }

  private async applyBackstabToUnit(unit: Unit, damageBonus: number): Promise<void> {
    this.unitModifier = new Modifier(KEYWORDS.BACKSTAB.id, this.game, unit.card, {
      name: KEYWORDS.BACKSTAB.name,
      description: KEYWORDS.BACKSTAB.description,
      icon: 'icons/keyword-backstab',
      mixins: [
        new UnitInterceptorModifierMixin(this.game, {
          key: 'damageDealt',
          interceptor: (value, ctx) =>
            ctx.target.behind?.unit?.equals(this.target.unit)
              ? value + damageBonus
              : value
        }),
        new UnitInterceptorModifierMixin(this.game, {
          key: 'canBeCounterattackTarget',
          interceptor: (value, ctx) =>
            ctx.attacker.behind?.unit?.equals(this.target.unit) ? false : true
        })
      ]
    });

    await unit.modifiers.add(this.unitModifier);
  }
}
