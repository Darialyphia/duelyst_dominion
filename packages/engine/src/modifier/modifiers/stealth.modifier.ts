import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { UNIT_EVENTS } from '../../unit/unit.enums';
import type { UnitAttackEvent } from '../../unit/unit-events';
import {
  SHRINE_EVENTS,
  type ShrineCaptureEvent
} from '../../board/entities/shrine.entity';

export class StealthModifier extends Modifier<MinionCard> {
  private unitModifier: Modifier<Unit> | null = null;

  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.STEALTH.id, game, source, {
      mixins: [
        new UnitEffectModifierMixin(game, {
          onApplied: async unit => {
            await this.applyStealthToUnit(unit);
          },
          onRemoved: async unit => {
            if (this.unitModifier) {
              await this.removeStealthFromUnit(unit);
            }
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }

  private onAfterAttack = async (event: UnitAttackEvent) => {
    if (!this.unitModifier) return;
    const unit = event.data.unit;
    if (!unit.equals(this.unitModifier.target)) return;

    await this.removeStealthFromUnit(unit);
  };

  private onAfterCapture = async (event: ShrineCaptureEvent) => {
    if (!this.unitModifier) return;
    const unit = event.data.unit;
    if (!unit.equals(this.unitModifier.target)) return;

    await this.removeStealthFromUnit(unit);
  };

  private async applyStealthToUnit(unit: Unit): Promise<void> {
    this.unitModifier = new Modifier(KEYWORDS.STEALTH.id, this.game, unit.card, {
      name: KEYWORDS.STEALTH.name,
      description: KEYWORDS.STEALTH.description,
      icon: 'icons/keyword-stealth',
      mixins: [
        new UnitInterceptorModifierMixin(this.game, {
          key: 'canBeAttackTarget',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(this.game, {
          key: 'canBeCardTarget',
          interceptor: () => false
        }),
        new GameEventModifierMixin(this.game, {
          eventName: UNIT_EVENTS.UNIT_AFTER_ATTACK,
          handler: this.onAfterAttack.bind(this)
        }),
        new GameEventModifierMixin(this.game, {
          eventName: SHRINE_EVENTS.SHRINE_AFTER_CAPTURE,
          handler: this.onAfterCapture.bind(this)
        })
      ]
    });

    await unit.modifiers.add(this.unitModifier);
  }

  private async removeStealthFromUnit(unit: Unit): Promise<void> {
    if (this.unitModifier) {
      await unit.modifiers.remove(this.unitModifier);
      this.unitModifier = null;
    }
    await this.addInterceptor('isEnabled', () => false);
  }
}
