import { isDefined, type MaybePromise } from '@game/shared';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import { MINION_EVENTS, MinionSummonedEvent } from '../../card/events/minion.events';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';
import type { GeneralCard } from '../../card/entities/general-card.entity';

export class UnitEffectModifierMixin<
  T extends MinionCard | GeneralCard
> extends ModifierMixin<T> {
  modifier!: Modifier<T>;

  constructor(
    game: Game,
    private options: {
      onApplied: (unit: Unit) => MaybePromise<void>;
      onRemoved: (unit: Unit) => MaybePromise<void>;
    }
  ) {
    super(game);
    this.onAfterSummoned = this.onAfterSummoned.bind(this);
  }

  private async onAfterSummoned(event: MinionSummonedEvent) {
    if (!event.data.card.equals(this.modifier.target)) return;
    await this.options.onApplied(event.data.card.unit!);
  }

  async onApplied(target: T, modifier: Modifier<T>) {
    this.modifier = modifier;
    if (isDefined(this.modifier.target.unit)) {
      await this.options.onApplied(this.modifier.target.unit!);
    }
    this.game.on(MINION_EVENTS.MINION_AFTER_SUMMON, this.onAfterSummoned);
  }

  async onRemoved() {
    this.game.off(MINION_EVENTS.MINION_AFTER_SUMMON, this.onAfterSummoned);
    if (isDefined(this.modifier.target.unit)) {
      await this.options.onRemoved(this.modifier.target.unit!);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReapplied(): void {}
}
