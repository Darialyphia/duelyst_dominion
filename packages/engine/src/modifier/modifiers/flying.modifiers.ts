import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { PassThroughPathfindingStrategy } from '../../pathfinding/strategies/passthrough-pathfinding.strategy';
import type { GeneralCard } from '../../card/entities/general-card.entity';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';

export class FlyingModifier<T extends MinionCard | GeneralCard> extends Modifier<T> {
  private unitModifier: Modifier<Unit> | null = null;

  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.FLYING.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.FLYING),
        new UnitEffectModifierMixin<T>(game, {
          onApplied: async unit => {
            await this.applyFlyToUnit(unit);
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

  private async applyFlyToUnit(unit: Unit): Promise<void> {
    this.unitModifier = new Modifier(KEYWORDS.FLYING.id, this.game, unit.card, {
      name: KEYWORDS.FLYING.name,
      description: KEYWORDS.FLYING.description,
      icon: 'icons/keyword-flying',
      mixins: [
        new UnitInterceptorModifierMixin(this.game, {
          key: 'movementReach',
          interceptor: value => value + 2
        }),
        new UnitInterceptorModifierMixin(this.game, {
          key: 'pathfindingStrategy',
          interceptor: () => new PassThroughPathfindingStrategy(this.game, unit)
        })
      ]
    });

    await unit.modifiers.add(this.unitModifier);
  }
}
