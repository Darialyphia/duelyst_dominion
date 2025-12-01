import { isDefined, type Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import {
  TARGETING_TYPE,
  type TargetingStrategy,
  type TargetingType
} from '../../targeting/targeting-strategy';
import type { GenericAOEShape } from '../../aoe/aoe-shape';
import { SingleCounterAttackParticipantStrategy } from '../counterattack-participants';

export class TargetingComponent {
  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  get attackTargettingPattern(): TargetingStrategy {
    return this.unit.interceptors.attackTargetingPattern.getValue(
      this.unit.card.attackPattern,
      {}
    );
  }

  get attackTargetType(): TargetingType {
    return this.unit.interceptors.attackTargetType.getValue(
      TARGETING_TYPE.ENEMY_UNIT,
      {}
    );
  }

  get attackAOEShape(): GenericAOEShape {
    return this.unit.interceptors.attackAOEShape.getValue(
      this.unit.card.attackAOEShape,
      {}
    );
  }

  get counterattackTargetingPattern(): TargetingStrategy {
    return this.unit.interceptors.counterattackTargetingPattern.getValue(
      this.unit.card.counterattackPattern,
      {}
    );
  }

  get counterattackTargetType(): TargetingType {
    return this.unit.interceptors.counterattackTargetType.getValue(
      TARGETING_TYPE.ENEMY_UNIT,
      {}
    );
  }

  get counterattackAOEShape(): GenericAOEShape {
    return this.unit.interceptors.counterattackAOEShape.getValue(
      this.unit.card.counterattackAOEShape,
      {}
    );
  }

  getCounterattackParticipants(initialTarget: Unit) {
    return this.unit.interceptors.attackCounterattackParticipants
      .getValue(new SingleCounterAttackParticipantStrategy(), {})
      .getCounterattackParticipants({
        attacker: this.unit,
        initialTarget,
        affectedUnits: this.attackAOEShape
          .getArea([initialTarget])
          .map(point => this.game.unitSystem.getUnitAt(point))
          .filter(isDefined)
      });
  }

  canBeAttackedBy(unit: Unit): boolean {
    return this.unit.interceptors.canBeAttackTarget.getValue(this.unit.isAlive, {
      attacker: unit
    });
  }

  canBeCounterattackedBy(unit: Unit): boolean {
    return this.unit.interceptors.canBeCounterattackTarget.getValue(this.unit.isAlive, {
      attacker: unit
    });
  }

  canBeTargetedBy(card: AnyCard): boolean {
    return this.unit.interceptors.canBeCardTarget.getValue(this.unit.isAlive, { card });
  }

  canAttack(unit: Unit): boolean {
    return this.unit.interceptors.canAttack.getValue(
      this.unit.attacksPerformedThisTurn < this.unit.maxAttacksPerTurn &&
        !this.unit.isExhausted,
      { target: unit }
    );
  }

  canAttackAt(point: Point) {
    if (this.unit.position.equals(point)) {
      return false;
    }
    const target = this.game.unitSystem.getUnitAt(point);
    if (!target) return false;

    if (!this.canAttack(target) || !target.canBeAttackedBy(this.unit)) {
      return false;
    }

    return this.attackTargettingPattern.canTargetAt(point);
  }

  canCounterAttack(unit: Unit): boolean {
    return this.unit.interceptors.canCounterAttack.getValue(
      this.unit.combat.counterAttacksCount < this.unit.maxCounterattacksPerTurn,
      { attacker: unit }
    );
  }

  canCounterAttackAt(point: Point) {
    if (this.unit.position.equals(point)) {
      return false;
    }

    const target = this.game.unitSystem.getUnitAt(point);
    if (!target) return false;

    return (
      this.unit.canCounterAttack(target) &&
      this.counterattackTargetingPattern.canTargetAt(point)
    );
  }

  // Check if the unit can attack a point if it were in a given position
  isWithinDangerZone(point: Point, position: Point) {
    const original = this.unit.position.clone();
    this.unit.movement.position.x = position.x;
    this.unit.movement.position.y = position.y;
    const canAttack = this.attackTargettingPattern.isWithinRange(point);
    this.unit.movement.position = original;
    return canAttack;
  }
}
