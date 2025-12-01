import type { Unit } from '../../unit.entity';

/**
 * Evaluates how threatening or valuable a target is for attack.
 * Returns a numeric score where higher = higher priority target.
 */
export interface ThreatEvaluator {
  /**
   * Evaluate the threat/value of attacking a target.
   * @param attacker - The unit considering the attack
   * @param target - The potential target to evaluate
   * @returns Numeric score (can be negative for bad ideas)
   */
  evaluate(attacker: Unit, target: Unit): number;

  /**
   * The importance weight of this evaluator relative to others.
   * Higher weight = more influence on final decision.
   */
  readonly weight: number;
}
