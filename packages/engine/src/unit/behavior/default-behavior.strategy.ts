import type { Nullable, Vec2 } from '@game/shared';
import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';
import type { BehaviorStrategy } from './behavior.strategy';
import { CompositeThreatEvaluator } from './evaluators/composite-threat.evaluator';
import { LethalThreatEvaluator } from './evaluators/lethal-threat.evaluator';
import { DamageOutputEvaluator } from './evaluators/damage-output.evaluator';
import { ValueEvaluator } from './evaluators/value.evaluator';
import { TradeEvaluator } from './evaluators/trade.evaluator';
import { MobilityThreatEvaluator } from './evaluators/mobility-threat.evaluator';
import { PositionalThreatEvaluator } from './evaluators/positional-threat.evaluator';

export class DefaultBehaviorStrategy implements BehaviorStrategy {
  private threatEvaluator: CompositeThreatEvaluator;

  constructor(
    private game: Game,
    private unit: Unit
  ) {
    // Compose all evaluators with their weights
    this.threatEvaluator = new CompositeThreatEvaluator([
      new LethalThreatEvaluator(game), // weight: 10.0 - Critical threats
      new TradeEvaluator(), // weight: 6.0 - Trade efficiency
      new DamageOutputEvaluator(), // weight: 5.0 - Raw damage
      new ValueEvaluator(), // weight: 4.0 - Target value
      new MobilityThreatEvaluator(game), // weight: 3.0 - Mobility threats
      new PositionalThreatEvaluator(game) // weight: 2.0 - Position threats
    ]);
  }

  /**
   * Calculate threat score for a potential target.
   * Higher score = higher priority target.
   */
  private getWeightForAttackableUnit(target: Unit): number {
    return this.threatEvaluator.evaluate(this.unit, target);
  }

  /**
   * Get all potential targets ranked by threat/value.
   * Returns targets in descending order of priority.
   */
  private getAttackTargetsRanking(): Unit[] {
    return this.unit.player.opponent.units
      .filter(target => this.isValidTarget(target))
      .sort(
        (a, b) => this.getWeightForAttackableUnit(b) - this.getWeightForAttackableUnit(a)
      );
  }

  /**
   * Check if a target is valid for attack consideration.
   */
  private isValidTarget(target: Unit): boolean {
    // Target must be alive
    if (!target.isAlive) return false;

    // For now, all alive enemy units are valid targets
    // Can add more sophisticated filtering here
    return true;
  }

  findBestTarget(): Unit {
    const rankedTargets = this.getAttackTargetsRanking();
    return rankedTargets[0] || this.unit.player.opponent.general;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findBestPositionToAttack(target: Unit): Nullable<Vec2> {
    // TODO: Implement position finding logic
    return this.unit.position;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findBestPathToTarget(target: Unit): Nullable<Vec2[]> {
    // TODO: Implement pathfinding logic
    return [];
  }
}
