import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import { UNIT_EVENTS } from '../unit.enums';
import {
  UnitBeforeHealEvent,
  UnitAfterHealEvent,
  UnitBeforeDestroyEvent,
  UnitAfterDestroyEvent
} from '../unit-events';

export class HealthComponent {
  private damageTaken = 0;

  constructor(
    private game: Game,
    private unit: Unit,
    private getMaxHpValue: () => number
  ) {}

  get maxHp(): number {
    return this.getMaxHpValue();
  }

  get remainingHp() {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  get isAlive() {
    return this.remainingHp > 0;
  }

  async heal(source: AnyCard, amount: number) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_HEAL,
      new UnitBeforeHealEvent({ unit: this.unit, amount, source })
    );

    this.addHp(amount);

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_HEAL,
      new UnitAfterHealEvent({ unit: this.unit, amount, source })
    );
  }

  addHp(amount: number) {
    this.damageTaken = Math.max(this.damageTaken - amount, 0);
  }

  async removeHp(amount: number) {
    this.damageTaken = Math.min(this.damageTaken + amount, this.maxHp);

    await this.checkHp({ source: this.unit.card });
  }

  async checkHp({ source }: { source: AnyCard }) {
    if (!this.isAlive) {
      await this.game.inputSystem.schedule(() => this.destroy(source));
    }
  }

  async destroy(source: AnyCard) {
    if (!this.unit.canBeDestroyed) return;

    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_DESTROY,
      new UnitBeforeDestroyEvent({ source, unit: this.unit })
    );

    const position = this.unit.position.clone();

    await this.removeFromBoard();
    this.unit.modifiers.list.forEach(async modifier => {
      await this.unit.modifiers.remove(modifier.id);
    });

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_DESTROY,
      new UnitAfterDestroyEvent({ source, destroyedAt: position, unit: this.unit })
    );
  }

  async removeFromBoard() {
    for (const modifier of this.unit.modifiers.list) {
      await this.unit.modifiers.remove(modifier.id);
    }
    this.game.unitSystem.removeUnit(this.unit);
  }
}
