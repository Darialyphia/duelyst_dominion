import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';

/**
 * Combines multiple threat evaluators into a single weighted score.
 * Uses the composite pattern to evaluate threats from multiple perspectives.
 */
export class CompositeThreatEvaluator {
  constructor(private evaluators: ThreatEvaluator[]) {}

  evaluate(attacker: Unit, target: Unit): number {
    return this.evaluators.reduce((total, evaluator) => {
      const score = evaluator.evaluate(attacker, target);
      const weightedScore = score * evaluator.weight;
      return total + weightedScore;
    }, 0);
  }

  /**
   * Get detailed breakdown of scores for debugging/UI purposes.
   */
  getScoreBreakdown(
    attacker: Unit,
    target: Unit
  ): Array<{
    evaluator: string;
    score: number;
    weight: number;
    weightedScore: number;
  }> {
    return this.evaluators.map(evaluator => {
      const score = evaluator.evaluate(attacker, target);
      return {
        evaluator: evaluator.constructor.name,
        score,
        weight: evaluator.weight,
        weightedScore: score * evaluator.weight
      };
    });
  }
}
