import type { AnyCard } from '../../card/entities/card.entity';
import type { GeneralCard } from '../../card/entities/general-card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class WhileOnBoardModifier<
  T extends MinionCard | GeneralCard
> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    {
      modifier,
      mixins = [],
      modifierType = 'while-on-board'
    }: {
      modifier: Modifier<Unit>;
      mixins?: ModifierMixin<T>[];
      modifierType?: string;
    }
  ) {
    super(modifierType, game, source, {
      mixins: [
        new UnitEffectModifierMixin(game, {
          onApplied: async unit => {
            await unit.modifiers.add(modifier);
          },
          onRemoved: async unit => {
            await unit.modifiers.remove(modifier);
          }
        }),
        ...mixins
      ]
    });
  }
}
