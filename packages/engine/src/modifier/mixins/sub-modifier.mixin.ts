import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class SubModifierMixin<
  T extends ModifierTarget,
  TTarget extends ModifierTarget
> extends ModifierMixin<T> {
  constructor(
    game: Game,
    private readonly options: {
      modifier: Modifier<TTarget>;
      getModifierTarget: (modifier: Modifier<T>) => TTarget;
    }
  ) {
    super(game);
  }

  async onApplied(target: T, modifier: Modifier<T>) {
    await this.options.getModifierTarget(modifier).modifiers.add(this.options.modifier);
  }

  async onRemoved(target: T, modifier: Modifier<T>): Promise<void> {
    await this.options
      .getModifierTarget(modifier)
      .modifiers.remove(this.options.modifier);
  }

  onReapplied(): void {}
}
