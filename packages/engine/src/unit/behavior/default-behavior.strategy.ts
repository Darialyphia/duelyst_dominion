import type { Nullable, Vec2 } from '@game/shared';
import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';
import type { BehaviorStrategy } from './behavior.strategy';
import { ZoneCalculator } from '../zone-calculator';
import { CombatDamage } from '../../utils/damage';

export class DefaultBehaviorStrategy implements BehaviorStrategy {
  private zoneCalculator: ZoneCalculator;

  constructor(
    private game: Game,
    private unit: Unit
  ) {
    this.zoneCalculator = new ZoneCalculator(this.game, unit);
  }

  private canKill(target: Unit): boolean {
    return new CombatDamage(this.unit).getFinalAmount(target) >= target.remainingHp;
  }

  private canBeKilledBy(target: Unit): boolean {
    return new CombatDamage(target).getFinalAmount(this.unit) >= this.unit.remainingHp;
  }

  private canKillOwnGeneral(target: Unit) {
    if (target.isExhausted) return false;
    const dangerZone = new ZoneCalculator(this.game, target).calculateZones().dangerZone;
    const isWithinGeneralRange = dangerZone.some(cellId =>
      this.game.boardSystem.getCellById(cellId)?.position.equals(this.unit.player.general)
    );
    if (!isWithinGeneralRange) return false;

    return (
      new CombatDamage(target).getFinalAmount(this.unit.player.general) >=
      this.unit.player.general.remainingHp
    );
  }

  private getWeightForAttackableUnit(target: Unit) {
    if (target.isGeneral && this.canKill(target)) {
      return 1000;
    }
    if (this.canKillOwnGeneral(target)) {
      return 999;
    }
    const canKill = this.canKill(target);
    const canBeKilled = this.canBeKilledBy(target);
    const canAttack = target.canAttack(this.unit) && this.unit.canBeAttackedBy(target);
    const canCounterattack =
      target.canCounterattack(this.unit) && this.unit.canBeCounterattackedBy(target);

    /* Priority rules:
      

    */
  }

  private getAttackTargetsRanking(): Unit[] {
    return this.unit.player.opponent.units.sort(
      (a, b) => this.getWeightForAttackableUnit(b) - this.getWeightForAttackableUnit(a)
    );
  }

  findBestTarget(): Unit {
    return this.unit.player.opponent.general;
  }

  findBestPositionToAttack(target: Unit): Nullable<Vec2> {
    return this.unit.position;
  }

  findBestPathToTarget(target: Unit): Nullable<Vec2[]> {
    return [];
  }
}
