import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { AuraModifierMixin } from '../mixins/aura.mixin';
import { isMinionOrGeneral } from '../../card/card-utils';
import type { GeneralCard } from '../../card/entities/general-card.entity';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';

const PROVOKED_MODIFIER_ID = 'provoked';

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
        new AuraModifierMixin<Unit, MinionCard | GeneralCard>(this.game, {
          isElligible: candidate => {
            return this.shouldBeProvoked(candidate);
          },
          onGainAura: async candidate => {
            console.log('provoking', candidate.id);
            await this.provokeEnemy(candidate);
          },
          onLoseAura: async candidate => {
            console.log('unprovoking', candidate.id);
            await candidate.unit?.modifiers.remove(PROVOKED_MODIFIER_ID);
          }
        })
      ]
    });

    await unit.modifiers.add(this.unitModifier);
  }

  private async provokeEnemy(candidate: MinionCard | GeneralCard): Promise<void> {
    await candidate.unit.modifiers.add(
      new Modifier(PROVOKED_MODIFIER_ID, this.game, this.source, {
        mixins: [
          new UnitInterceptorModifierMixin(this.game, {
            key: 'canMove',
            interceptor: () => false
          }),
          new UnitInterceptorModifierMixin(this.game, {
            key: 'canAttack',
            interceptor: (value, { target }) => {
              if (!value) return value;

              return target.modifiers.has(KEYWORDS.PROVOKE.id);
            }
          })
        ]
      })
    );
  }
}
