import { extend } from 'lodash-es';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';

export class CelerityModifier extends Modifier<MinionCard> {
  private unitModifier: Modifier<Unit> | null = null;

  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.CELERITY.id, game, source, {
      name: KEYWORDS.CELERITY.name,
      description: KEYWORDS.CELERITY.description,
      icon: 'icons/keyword-celerity',
      mixins: [
        new UnitEffectModifierMixin(game, {
          onApplied: async unit => {
            await this.applyCelerityToUnit(unit);
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

  private async applyCelerityToUnit(unit: Unit): Promise<void> {
    this.unitModifier = new Modifier(KEYWORDS.CELERITY.id, this.game, unit.card, {
      name: KEYWORDS.CELERITY.name,
      description: KEYWORDS.CELERITY.description,
      icon: 'icons/keyword-celerity',
      mixins: [
        new UnitInterceptorModifierMixin(this.game, {
          key: 'maxAttacksPerTurn',
          interceptor: value => value + 1
        }),
        new UnitInterceptorModifierMixin(this.game, {
          key: 'maxMovementsPerTurn',
          interceptor: value => value + 1
        })
      ]
    });

    await unit.modifiers.add(this.unitModifier);
  }
}
