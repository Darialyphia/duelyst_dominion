import { Vec2, type Point } from '@game/shared';
import type { Game } from '../../game/game';
import { CombatDamage, Damage } from '../../utils/damage';
import {
  UnitAttackEvent,
  UnitDealDamageEvent,
  UnitReceiveDamageEvent
} from '../unit-events';
import type { Unit } from '../unit.entity';
import { UNIT_EVENTS } from '../unit.enums';
import type { AnyCard } from '../../card/entities/card.entity';

export class CombatComponent {
  private _attacksCount = 0;
  private _counterAttacksCount = 0;

  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  get counterAttacksCount() {
    return this._counterAttacksCount;
  }

  get attacksCount() {
    return this._attacksCount;
  }

  setAttackCount(count: number) {
    this._attacksCount = count;
  }

  resetAttackCount() {
    this._attacksCount = 0;
    this._counterAttacksCount = 0;
  }

  resetCounterAttackCount() {
    this._counterAttacksCount = 0;
  }

  async counterAttack(attacker: Unit) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_COUNTERATTACK,
      new UnitAttackEvent({
        target: attacker.position
      })
    );
    const targets = this.unit.counterattackAOEShape.getUnits([attacker]);

    const damage = new CombatDamage(this.unit);

    await this.dealDamage(targets, damage);
    this._counterAttacksCount++;

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_COUNTERATTACK,
      new UnitAttackEvent({
        target: attacker.position
      })
    );
  }

  async attack(target: Point) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_ATTACK,
      new UnitAttackEvent({
        target: Vec2.fromPoint(target)
      })
    );
    const targets = this.unit.attackAOEShape.getUnits([target]);
    const damage = new CombatDamage(this.unit);

    await this.dealDamage(targets, damage);
    this._attacksCount++;

    const unit = this.game.unitSystem.getUnitAt(target)!;
    if (!unit) return; // means unit died from attack

    // we check counterattack before emitting AFTER_ATTACK event to enable effects that would prevent counter attack for one attack only
    // ex: Fearsome
    const counterAttackParticipants = this.unit
      .getCounterattackParticipants(unit)
      .filter(unit => {
        return (
          unit.canCounterAttackAt(this.unit.position) &&
          this.unit.canBeCounterattackedBy(unit)
        );
      });

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_ATTACK,
      new UnitAttackEvent({
        target: Vec2.fromPoint(target)
      })
    );

    for (const unit of counterAttackParticipants) {
      await unit.counterAttack(this.unit);
    }
  }

  async dealDamage(targets: Unit[], damage: Damage) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_DEAL_DAMAGE,
      new UnitDealDamageEvent({ targets, damage })
    );
    for (const target of targets) {
      await target.takeDamage(this.unit.card, damage);
    }
    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_DEAL_DAMAGE,
      new UnitDealDamageEvent({ targets, damage })
    );
  }

  async takeDamage(from: AnyCard, damage: Damage) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE,
      new UnitReceiveDamageEvent({
        from,
        target: this.unit,
        damage
      })
    );

    await this.unit.removeHp(damage.getFinalAmount(this.unit));

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
      new UnitReceiveDamageEvent({
        from,
        target: this.unit,
        damage
      })
    );
  }
}
