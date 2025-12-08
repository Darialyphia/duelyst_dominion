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
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';

export class StealthModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.STEALTH.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.STEALTH),
        new UnitEffectModifierMixin(game, {
          onApplied: async unit => {
            await unit.modifiers.add(new StealthUnitModifier(game, source, {}));
          },
          onRemoved: async unit => {
            await unit.modifiers.remove(StealthUnitModifier);
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class StealthUnitModifier extends Modifier<Unit> {
  private hasAttacked = false;
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      isRemovable?: boolean;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.STEALTH.id, game, source, {
      name: KEYWORDS.STEALTH.name,
      description: KEYWORDS.STEALTH.description,
      icon: 'icons/keyword-stealth',
      isRemovable: options.isRemovable ?? true,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeAttackTarget',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCardTarget',
          interceptor: () => false
        }),
        new GameEventModifierMixin(game, {
          eventName: UNIT_EVENTS.UNIT_AFTER_ATTACK,
          handler: event => {
            return this.onAfterAttack(event);
          }
        }),
        new TogglableModifierMixin(game, () => !this.hasAttacked),
        ...(options.mixins ?? [])
      ]
    });
  }

  private async onAfterAttack(event?: UnitAttackEvent) {
    if (!event) return;
    const unit = event.data.unit;
    if (!unit.equals(this.target)) return;

    this.hasAttacked = true;
  }
}
