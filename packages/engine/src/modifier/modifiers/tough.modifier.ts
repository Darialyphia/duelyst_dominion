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
import { TARGETING_TYPE } from '../../targeting/targeting-strategy';
import { RangedTargetingStrategy } from '../../targeting/ranged-targeting-strategy';

export class ToughModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      amount: number;
      mixins?: ModifierMixin<T>[];
      unitMixins: ModifierMixin<Unit>[];
    }
  ) {
    super(KEYWORDS.TOUGH.id, game, source, {
      name: KEYWORDS.TOUGH.name,
      description: KEYWORDS.TOUGH.description,
      icon: 'icons/keyword-intercept',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.TOUGH),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new ToughUnitModifier(game, source, {
              amount: options.amount,
              mixins: options.unitMixins
            })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class ToughUnitModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      amount: number;
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.TOUGH.id, game, source, {
      name: KEYWORDS.TOUGH.name,
      description: KEYWORDS.TOUGH.description,
      icon: 'icons/keyword-intercept',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'damageReceived',
          interceptor: amount => Math.max(0, amount - this.options.amount)
        }),

        ...(options.mixins ?? [])
      ]
    });
  }
}
