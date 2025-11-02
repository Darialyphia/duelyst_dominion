import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class TogglableModifierMixin<T extends ModifierTarget> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;

  constructor(
    game: Game,
    private predicate: () => boolean
  ) {
    super(game);
    this.check = this.check.bind(this);
  }

  get iActive() {
    return this.predicate();
  }

  check() {
    const toggleMods = this.modifier.getMixin(TogglableModifierMixin);
    const idx = toggleMods.indexOf(this);
    if (idx === 0) {
      const isAllActive = toggleMods.every(mod => mod.iActive);
      if (!isAllActive) {
        this.modifier.disable();
      } else {
        this.modifier.enable();
      }
    }
  }

  onApplied(target: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.on('*', this.check);
  }

  onRemoved(): void {
    this.game.off('*', this.check);
  }

  onReapplied() {}
}
