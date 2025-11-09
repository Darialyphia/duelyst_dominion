import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';

export class ZealModifier extends Modifier<MinionCard> {
  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    options: {
      threshold: number;
      mixins: ModifierMixin<Unit>[];
    }
  ) {
    super(modifierType, game, source, {
      name: KEYWORDS.ZEAL.name,
      description: KEYWORDS.ZEAL.description,
      icon: 'icons/keyword-zeal',
      mixins: [
        new UnitEffectModifierMixin(game, {
          onApplied: async unit => {
            await this.applyZeal(unit, game, options);
          },
          onRemoved: async unit => {
            await unit.modifiers.remove(this.unitModifierId);
          }
        })
      ]
    });
  }

  get unitModifierId() {
    return `${this.modifierType}-unit-effect`;
  }

  private async applyZeal(
    unit: Unit,
    game: Game,
    options: { threshold: number; mixins: ModifierMixin<Unit>[] }
  ) {
    await unit.modifiers.add(
      new Modifier(this.unitModifierId, game, this.target, {
        mixins: [
          new TogglableModifierMixin(game, modifier => this.isZealed(modifier, options)),
          ...options.mixins
        ]
      })
    );
  }

  private isZealed(
    modifier: Modifier<Unit>,
    options: {
      threshold: number;
      mixins: ModifierMixin<Unit>[];
    }
  ) {
    return (
      [...modifier.target.nearbyUnits, ...modifier.target.nearbyShrines].filter(
        neighbor => neighbor.player?.equals(modifier.target.player)
      ).length >= options.threshold
    );
  }
}
