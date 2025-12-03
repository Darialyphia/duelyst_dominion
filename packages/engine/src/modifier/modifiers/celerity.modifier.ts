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
import type { GeneralCard } from '../../card/entities/general-card.entity';

export class CelerityCardModifier<
  T extends MinionCard | GeneralCard
> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.CELERITY.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.CELERITY),
        new UnitEffectModifierMixin(game, {
          onApplied: async unit => {
            await unit.modifiers.add(
              new CelerityUnitModifier(game, this.source, { mixins: [] })
            );
          },
          onRemoved: async unit => {
            await unit.modifiers.remove(CelerityUnitModifier);
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class CelerityUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<Unit>[]; modifierType?: string }
  ) {
    super(options.modifierType ?? KEYWORDS.CELERITY.id, game, source, {
      name: KEYWORDS.CELERITY.name,
      description: KEYWORDS.CELERITY.description,
      icon: 'icons/keyword-celerity',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'maxAttacksPerTurn',
          interceptor: value => value + 1
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'maxMovementsPerTurn',
          interceptor: value => value + 1
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
