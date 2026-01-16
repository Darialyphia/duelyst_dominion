import { isDefined, Vec2 } from '@game/shared';
import type { Game } from '../../game/game';
import { CombatDamage, Damage } from '../../utils/damage';
import {
  UnitAttackEvent,
  UnitDealDamageEvent,
  UnitReceiveDamageEvent
} from '../unit-events';
import { Unit } from '../unit.entity';
import { UNIT_EVENTS } from '../unit.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import { Player } from '../../player/player.entity';

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
        targetType: 'unit',
        target: attacker,
        unit: this.unit
      })
    );
    const targets = this.unit.counterattackAOEShape
      .getArea([attacker])
      .map(point => this.game.unitSystem.getUnitAt(point))
      .filter(isDefined);

    const damage = new CombatDamage(this.unit, 'counterattack');

    await this.dealDamage(targets, damage);
    this._counterAttacksCount++;

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_COUNTERATTACK,
      new UnitAttackEvent({
        targetType: 'unit',
        target: attacker,
        unit: this.unit
      })
    );
  }

  async attack(target: Unit | Player) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_ATTACK,
      new UnitAttackEvent({
        targetType: target instanceof Unit ? 'unit' : 'player',
        target,
        unit: this.unit
      })
    );
    const targets =
      target instanceof Unit
        ? this.unit.attackAOEShape
            .getArea([target])
            .map(point => this.game.unitSystem.getUnitAt(point))
            .filter(isDefined)
        : [target];
    const damage = new CombatDamage(this.unit, 'attack');

    await this.dealDamage(targets, damage);
    this._attacksCount++;

    if (target instanceof Player) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_AFTER_ATTACK,
        new UnitAttackEvent({
          targetType: 'player',
          target,
          unit: this.unit
        })
      );
      return;
    }

    const unit = this.game.unitSystem.getUnitAt(target)!;
    if (!unit) return; // means unit died from attack

    // we check counterattack before emitting AFTER_ATTACK event to enable effects that would prevent counter attack for one attack only
    // ex: Fearsome
    const counterAttackParticipants = this.unit
      .getCounterattackParticipants(unit)
      .filter(unit => {
        return unit.canCounterAttack(this.unit) && this.unit.canBeCounterattackedBy(unit);
      });

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_ATTACK,
      new UnitAttackEvent({
        targetType: 'unit',
        target,
        unit: this.unit
      })
    );

    for (const unit of counterAttackParticipants) {
      await unit.counterAttack(this.unit);
    }
  }

  async dealDamage(targets: Array<Unit | Player>, damage: Damage) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_DEAL_DAMAGE,
      new UnitDealDamageEvent({ targets, damage, unit: this.unit })
    );
    for (const target of targets) {
      await target.takeDamage(this.unit.card, damage);
    }
    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_DEAL_DAMAGE,
      new UnitDealDamageEvent({ targets, damage, unit: this.unit })
    );
  }

  async takeDamage(from: AnyCard, damage: Damage, silent = false) {
    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE,
        new UnitReceiveDamageEvent({
          from,
          unit: this.unit,
          damage
        })
      );
    }

    await this.unit.removeHp(damage.getFinalAmount(this.unit));

    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
        new UnitReceiveDamageEvent({
          from,
          unit: this.unit,
          damage
        })
      );
    }
  }
}
