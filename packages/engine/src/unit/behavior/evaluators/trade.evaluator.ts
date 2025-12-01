import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';
import { CombatDamage } from '../../../utils/damage';

/**
 * TIER 2-3: Evaluates trade efficiency.
 * Considers whether attacking is a good exchange of resources.
 */
export class TradeEvaluator implements ThreatEvaluator {
  readonly weight = 6.0;

  evaluate(attacker: Unit, target: Unit): number {
    const canKillTarget = this.canKill(attacker, target);
    const willDieToCounter = this.wouldDieToCounterattack(attacker, target);

    // BEST: Kill them, survive counterattack
    if (canKillTarget && !willDieToCounter) {
      return 60;
    }

    // SUICIDE TRADE: Both die - evaluate if it's worth it
    if (canKillTarget && willDieToCounter) {
      return this.evaluateSuicideTrade(attacker, target);
    }

    // BAD: Die without killing them
    if (!canKillTarget && willDieToCounter) {
      return -80; // Strongly discourage
    }

    // CHIP DAMAGE: Neither dies
    if (!canKillTarget && !willDieToCounter) {
      return this.evaluateChipDamage(attacker, target);
    }

    return 0;
  }

  private canKill(attacker: Unit, target: Unit): boolean {
    const damage = new CombatDamage(attacker).getFinalAmount(target);
    return damage >= target.remainingHp;
  }

  private wouldDieToCounterattack(attacker: Unit, target: Unit): boolean {
    if (!target.canCounterAttack(attacker)) return false;
    if (!attacker.canBeCounterattackedBy(target)) return false;

    const counterDamage = new CombatDamage(target).getFinalAmount(attacker);
    return counterDamage >= attacker.remainingHp;
  }

  private evaluateSuicideTrade(attacker: Unit, target: Unit): number {
    const attackerValue = this.calculateUnitValue(attacker);
    const targetValue = this.calculateUnitValue(target);

    // If they're more valuable, it might be worth it
    const valueGained = targetValue - attackerValue;

    // Generals are special - never suicide into non-general
    if (attacker.isGeneral && !target.isGeneral) {
      return -100; // Never suicide the general
    }

    // Trading for enemy general is always good
    if (target.isGeneral) {
      return 50; // High value, but not as high as just killing them safely
    }

    // Normal suicide trade evaluation
    if (valueGained > 10) return 30; // Good trade
    if (valueGained > 0) return 10; // Slight advantage
    if (valueGained > -10) return -10; // Slight disadvantage
    return -30; // Bad trade
  }

  private evaluateChipDamage(attacker: Unit, target: Unit): number {
    const damage = new CombatDamage(attacker).getFinalAmount(target);
    const damageRatio = damage / target.remainingHp;

    // Dealing significant damage is okay, but not as good as killing
    // Dealing 50%+ of their HP: 15 points
    // Dealing 25% of their HP: 7.5 points
    return Math.min(damageRatio * 30, 15);
  }

  private calculateUnitValue(unit: Unit): number {
    if (unit.isGeneral) return 1000; // Generals are invaluable

    // Simple value calculation based on stats
    return unit.atk * 2 + unit.maxHp + unit.speed * 3;
  }
}
