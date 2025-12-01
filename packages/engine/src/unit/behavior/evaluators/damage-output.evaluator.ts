import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';

/**
 * TIER 2-3: Evaluates raw damage output potential.
 * Higher attack units are generally more threatening.
 */
export class DamageOutputEvaluator implements ThreatEvaluator {
  readonly weight = 5.0;

  evaluate(attacker: Unit, target: Unit): number {
    // Base threat from attack power
    let score = target.atk;

    // AOE attackers are more dangerous (can hit multiple units)
    const aoeMultiplier = this.getAOEMultiplier(target);
    score *= aoeMultiplier;

    // Fast attackers can attack more often (if multiple attacks allowed)
    if (target.maxAttacksPerTurn > 1) {
      score *= 1 + (target.maxAttacksPerTurn - 1) * 0.3;
    }

    return score;
  }

  private getAOEMultiplier(target: Unit): number {
    // Get the AOE size (number of tiles affected)
    const aoeSize = target.attackAOEShape.getArea([target.position]).length;

    // Each additional tile affected adds 20% threat
    return 1 + (aoeSize - 1) * 0.2;
  }
}
