import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';

/**
 * TIER 3-4: Evaluates the overall value of a target.
 * Considers stats, general status, and vulnerability.
 */
export class ValueEvaluator implements ThreatEvaluator {
  readonly weight = 4.0;

  evaluate(attacker: Unit, target: Unit): number {
    // Generals are extremely valuable targets
    if (target.isGeneral) return 100;

    // Base value from stats
    const statValue = this.calculateStatValue(target);

    // Vulnerable targets (low HP) are higher priority
    const vulnerabilityBonus = this.calculateVulnerabilityBonus(target);

    return statValue + vulnerabilityBonus;
  }

  private calculateStatValue(target: Unit): number {
    // Combine attack, health, and mobility into a value score
    const atkValue = target.atk * 2; // Attack is valuable
    const hpValue = target.maxHp; // Health represents durability
    const speedValue = target.speed * 3; // Speed is very valuable

    return (atkValue + hpValue + speedValue) / 10; // Normalize
  }

  private calculateVulnerabilityBonus(target: Unit): number {
    // Calculate how damaged the target is
    const healthRatio = target.remainingHp / target.maxHp;

    // Units near death are high priority (easier to finish off)
    // At 100% HP: 0 bonus
    // At 50% HP: 15 bonus
    // At 10% HP: 27 bonus
    return (1 - healthRatio) * 30;
  }
}
