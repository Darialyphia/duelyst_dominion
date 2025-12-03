import type { Modifier, ModifierTarget } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MaybePromise } from '@game/shared';
import type { Unit } from '../../unit/unit.entity';
import type { PlayerArtifact } from '../../player/player-artifact.entity';

export type CardAuraOptions<TCandidate extends AnyCard> = {
  isElligible(candidate: AnyCard): boolean;
  onGainAura(candidate: TCandidate): MaybePromise<void>;
  onLoseAura(candidate: TCandidate): MaybePromise<void>;
};

export class CardAuraModifierMixin<
  T extends ModifierTarget,
  TCandidate extends AnyCard = AnyCard
> extends ModifierMixin<T> {
  protected modifier!: Modifier<T>;

  private affectedCardIds = new Set<string>();

  // we need to track this variable because of how the event emitter works
  // basically if we have an event that says "after unit moves, remove this aura modifier"
  // It will not clean up aura's "after unit move" event before all the current listeners have been ran
  // which would lead to removing the aura, THEN check and apply the aura anyways
  private isApplied = true;

  constructor(
    game: Game,
    private options: CardAuraOptions<TCandidate>
  ) {
    super(game);
    this.checkAura = this.checkAura.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  private async checkAura() {
    if (!this.isApplied) return;

    for (const card of this.game.cardSystem.cards) {
      const shouldGetAura = this.options.isElligible(card);

      const hasAura = this.affectedCardIds.has(card.id);

      if (!shouldGetAura && hasAura) {
        this.affectedCardIds.delete(card.id);
        await this.options.onLoseAura(card as TCandidate);
        continue;
      }

      if (shouldGetAura && !hasAura) {
        this.affectedCardIds.add(card.id);
        await this.options.onGainAura(card as TCandidate);
        continue;
      }
    }
  }

  private async cleanup() {
    this.game.off('*', this.checkAura);

    for (const id of this.affectedCardIds) {
      const card = this.game.cardSystem.getCardById(id);
      if (!card) return;

      this.affectedCardIds.delete(id);
      await this.options.onLoseAura(card as TCandidate);
    }
  }

  onApplied(card: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.isApplied = true;

    this.game.on('*', this.checkAura);
  }

  async onRemoved() {
    this.isApplied = false;
    await this.cleanup();
  }

  onReapplied() {}
}

export type UnitAuraOptions = {
  isElligible(candidate: Unit): boolean;
  onGainAura(candidate: Unit): MaybePromise<void>;
  onLoseAura(candidate: Unit): MaybePromise<void>;
};

export class UnitAuraModifierMixin<
  T extends Unit | PlayerArtifact
> extends ModifierMixin<T> {
  protected modifier!: Modifier<T>;

  private affectedUnitIds = new Set<string>();

  // we need to track this variable because of how the event emitter works
  // basically if we have an event that says "after unit moves, remove this aura modifier"
  // It will not clean up aura's "after unit move" event before all the current listeners have been ran
  // which would lead to removing the aura, THEN check and apply the aura anyways
  private isApplied = true;

  constructor(
    game: Game,
    private options: UnitAuraOptions
  ) {
    super(game);
    this.checkAura = this.checkAura.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  private async checkAura() {
    if (!this.isApplied) return;

    for (const unit of this.game.unitSystem.units) {
      const shouldGetAura = this.options.isElligible(unit);

      const hasAura = this.affectedUnitIds.has(unit.id);

      if (!shouldGetAura && hasAura) {
        this.affectedUnitIds.delete(unit.id);
        await this.options.onLoseAura(unit);
        continue;
      }

      if (shouldGetAura && !hasAura) {
        this.affectedUnitIds.add(unit.id);
        await this.options.onGainAura(unit);
        continue;
      }
    }
  }

  private async cleanup() {
    this.game.off('*', this.checkAura);

    for (const id of this.affectedUnitIds) {
      const unit = this.game.unitSystem.getUnitById(id);
      if (!unit) return;

      this.affectedUnitIds.delete(id);
      await this.options.onLoseAura(unit);
    }
  }

  onApplied(unit: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.isApplied = true;

    this.game.on('*', this.checkAura);
  }

  async onRemoved() {
    this.isApplied = false;
    await this.cleanup();
  }

  onReapplied() {}
}
