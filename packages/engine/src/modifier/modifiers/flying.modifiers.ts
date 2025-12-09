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
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.FLYING.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.FLYING),
        new UnitEffectModifierMixin<T>(game, {
          onApplied: async unit => {
            await unit.modifiers.add(
              new FlyingUnitModifier(game, this.source, { mixins: [] })
            );
          },
          onRemoved: async unit => {
            await unit.modifiers.remove(FlyingUnitModifier);
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class FlyingUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<Unit>[]; modifierType?: string }
  ) {
    super(options.modifierType ?? KEYWORDS.FLYING.id, game, source, {
      name: KEYWORDS.FLYING.name,
      description: KEYWORDS.FLYING.description,
      icon: 'icons/keyword-flying',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'movementReach',
          interceptor: value => value + 2
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'pathfindingStrategy',
          interceptor: () => new PassThroughPathfindingStrategy(this.game, this.target)
        })
      ]
    });
  }
}
