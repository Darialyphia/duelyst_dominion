import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Interceptable } from '../../utils/interceptable';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';
import { BackstabEvent } from '../modifier.special-events';
import { UNIT_EVENTS } from '../../unit/unit.enums';
import { UnitEffectTriggeredEvent } from '../../unit/unit-events';
import { AbilityDamage } from '../../utils/damage';

export class BackstabModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<T>[];
      damageBonus: number;
      unitMixins?: ModifierMixin<Unit>[];
    }
  ) {
    super(KEYWORDS.BACKSTAB.id, game, source, {
      name: KEYWORDS.BACKSTAB.name,
      description: KEYWORDS.BACKSTAB.description,
      icon: 'icons/keyword-on-attack',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BACKSTAB),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new BackstabUnitModifier(game, source, {
              damageBonus: options.damageBonus,
              mixins: options.unitMixins ?? []
            })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class BackstabUnitModifier extends Modifier<Unit> {
  private backstabAmount = new Interceptable<number, BackstabUnitModifier>();

  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      damageBonus: number;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.BACKSTAB.id, game, source, {
      name: KEYWORDS.BACKSTAB.name,
      description: KEYWORDS.BACKSTAB.description,
      icon: 'icons/keyword-backstab',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_AFTER_SUMMON,
          filter: event => {
            if (!event) return false;

            return (
              event.data.card.player.equals(this.target.player) &&
              event.data.unit.position.x === this.target.position.x
            );
          },
          handler: async event => {
            if (!event) return;
            await this.backstab(event.data.unit);
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_AFTER_MOVE,
          filter: event => {
            if (!event) return false;

            return (
              event.data.unit.player.equals(this.target.player) &&
              event.data.unit.position.x === this.target.position.x
            );
          },
          handler: async event => {
            if (!event) return;
            await this.backstab(event.data.unit);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }

  private async backstab(unit: Unit) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_EFFECT_TRIGGERED,
      new UnitEffectTriggeredEvent({ unit: this.target })
    );
    await unit.takeDamage(
      this.target.card,
      new AbilityDamage(this.target.card, this.options.damageBonus)
    );
  }

  addBackstabAmountInterceptor(interceptor: (value: number) => number) {
    this.backstabAmount.add(interceptor);
    return () => this.removeBackstabAmountInterceptor(interceptor);
  }

  removeBackstabAmountInterceptor(interceptor: (value: number) => number) {
    this.backstabAmount.remove(interceptor);
  }
}

export class BackstabAmountModifierMixin extends ModifierMixin<Unit> {
  constructor(
    game: Game,
    private readonly interceptor: (value: number) => number
  ) {
    super(game);
  }

  onApplied(target: Unit): void {
    const backstabModifier = target.modifiers.get(BackstabUnitModifier);
    if (backstabModifier) {
      backstabModifier.addBackstabAmountInterceptor(this.interceptor);
    }
  }

  onRemoved(target: Unit): void {
    const backstabModifier = target.modifiers.get(BackstabUnitModifier);
    if (backstabModifier) {
      backstabModifier.removeBackstabAmountInterceptor(this.interceptor);
    }
  }

  onReapplied(): void {}
}
