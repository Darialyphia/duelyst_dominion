import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { CardAuraModifierMixin } from '../mixins/aura.mixin';
import { isMinionOrGeneral } from '../../card/card-utils';
import type { GeneralCard } from '../../card/entities/general-card.entity';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';

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
            await this.applyProvokeToUnit(unit);
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
    this.moveInterceptor = this.moveInterceptor.bind(this);
    this.attackInterceptor = this.attackInterceptor.bind(this);
  }

  private shouldBeProvoked(candidate: AnyCard): boolean {
    if (!isMinionOrGeneral(candidate)) return false;
    if (!candidate.unit) return false;
    if (candidate.location !== 'board') return false;
    if (candidate.isAlly(this.target)) return false;

    return (
      this.game.boardSystem.getDistance(
        this.target.unit.position,
        candidate.unit.position
      ) === 1
    );
  }

  private async applyProvokeToUnit(unit: Unit): Promise<void> {
    this.unitModifier = new Modifier(KEYWORDS.PROVOKE.id, this.game, unit.card, {
      name: KEYWORDS.PROVOKE.name,
      description: KEYWORDS.PROVOKE.description,
      icon: 'icons/keyword-provoke',
      mixins: [
        new CardAuraModifierMixin<Unit, MinionCard | GeneralCard>(this.game, {
          isElligible: candidate => {
            return this.shouldBeProvoked(candidate);
          },
          onGainAura: async candidate => {
            await candidate.unit.addInterceptor('canMove', this.moveInterceptor);
            await candidate.unit.addInterceptor('canAttack', this.attackInterceptor);
          },
          onLoseAura: async candidate => {
            await candidate.unit.removeInterceptor('canMove', this.moveInterceptor);
            await candidate.unit.removeInterceptor('canAttack', this.attackInterceptor);
          }
        })
      ]
    });

    await unit.modifiers.add(this.unitModifier);
  }

  moveInterceptor() {
    return false;
  }

  attackInterceptor(value: boolean, { target }: { target: Unit }): boolean {
    if (!value) return value;

    return target.modifiers.has(KEYWORDS.PROVOKE.id);
  }
}
