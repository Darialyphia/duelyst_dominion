import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitAuraModifierMixin } from '../mixins/aura.mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';

export class ProvokeModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.PROVOKE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROVOKE),
        new UnitEffectModifierMixin(game, {
          getModifier: () => new ProvokeUnitModifier(game, this.initialSource)
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class ProvokeUnitModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.PROVOKE.id, game, source, {
      name: KEYWORDS.PROVOKE.name,
      description: KEYWORDS.PROVOKE.description,
      icon: 'icons/keyword-provoke',
      mixins: [
        new UnitAuraModifierMixin(game, source, {
          isElligible: candidate => {
            return this.shouldBeProvoked(candidate);
          },
          getModifiers: () => {
            return [new ProvokedModifier(game, this.initialSource)];
          }
        })
      ]
    });
  }

  private shouldBeProvoked(candidate: Unit): boolean {
    if (candidate.isAlly(this.target)) return false;
    return (
      this.game.boardSystem.getDistance(this.target.position, candidate.position) === 1
    );
  }
}

export class ProvokedModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super('provoked', game, source, {
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: (value: boolean, { target }: { target: Unit }) => {
            if (!value) return value;

            return target.modifiers.has(KEYWORDS.PROVOKE.id);
          }
        })
      ]
    });
  }
}
