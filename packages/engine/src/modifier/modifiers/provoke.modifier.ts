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
  private unitModifier: Modifier<Unit> | null = null;

  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.PROVOKE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROVOKE),
        new UnitEffectModifierMixin(game, {
          onApplied: async unit => {
            await unit.modifiers.add(new ProvokeUnitModifier(game, this.source));
          },
          onRemoved: async unit => {
            await unit.modifiers.remove(ProvokeUnitModifier);
          }
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
        new UnitAuraModifierMixin(game, {
          isElligible: candidate => {
            return this.shouldBeProvoked(candidate);
          },
          onGainAura: async candidate => {
            await candidate.modifiers.add(new ProvokedModifier(game, this.source));
          },
          onLoseAura: async candidate => {
            await candidate.modifiers.remove(ProvokedModifier);
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
    super(KEYWORDS.PROVOKE.id, game, source, {
      isRemovable: false,
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
