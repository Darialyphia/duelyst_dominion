import { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class UntilEndOfTurnModifierMixin<
  T extends ModifierTarget
> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;

  constructor(game: Game) {
    super(game);
    this.onTurnEnd = this.onTurnEnd.bind(this);
  }

  async onTurnEnd() {
    console.log('Removing until end of turn modifier:', this.modifier.id);
    await this.modifier.target.modifiers.remove(this.modifier.id, {
      force: true
    });
  }

  onApplied(target: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.once(GAME_EVENTS.PLAYER_END_TURN, this.onTurnEnd);
  }

  onRemoved(): void {
    this.game.off(GAME_EVENTS.PLAYER_END_TURN, this.onTurnEnd);
  }

  onReapplied(): void {}
}
