import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Interceptable } from '../../utils/interceptable';

export class ZealModifier extends Modifier<MinionCard> {
  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    options: {
      mixins: ModifierMixin<Unit>[];
    }
  ) {
    super(modifierType, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ZEAL),
        new UnitEffectModifierMixin(game, {
          onApplied: async unit => {
            await unit.modifiers.add(
              new ZealUnitModifier(game, source, {
                mixins: options.mixins
              })
            );
          },
          onRemoved: async unit => {
            await unit.modifiers.remove(ZealUnitModifier);
          }
        })
      ]
    });
  }
}

export class ZealUnitModifier extends Modifier<Unit> {
  private _isZealed = new Interceptable<boolean>();

  get isZealed() {
    return this._isZealed.getValue(
      this.game.boardSystem.getDistance(
        this.target.position,
        this.target.player.general.position
      ) === 1,

      {}
    );
  }

  constructor(game: Game, source: AnyCard, options: { mixins?: ModifierMixin<Unit>[] }) {
    super(KEYWORDS.ZEAL.id, game, source, {
      name: KEYWORDS.ZEAL.name,
      description: KEYWORDS.ZEAL.description,
      icon: 'icons/keyword-zeal',
      mixins: [
        new TogglableModifierMixin(game, () => this.isZealed),
        ...(options?.mixins ?? [])
      ]
    });
  }

  addIsZealedInterceptor(interceptor: (value: boolean) => boolean) {
    this._isZealed.add(interceptor);
    return () => this.removeIsZealedInterceptor(interceptor);
  }

  removeIsZealedInterceptor(interceptor: (value: boolean) => boolean) {
    this._isZealed.remove(interceptor);
  }
}
