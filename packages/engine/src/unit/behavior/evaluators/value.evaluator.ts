import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';

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
    const atkValue = target.atk * 2;
    const hpValue = target.maxHp;
    const speedValue = target.speed;

    return (atkValue + hpValue + speedValue) / 10;
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
