import type { Game } from '../../../game/game';
import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';

/**
 * TIER 4: Evaluates positional threats.
 * Units in key positions or near important targets are higher priority.
 */
export class PositionalThreatEvaluator implements ThreatEvaluator {
  readonly weight = 2.0;

  constructor(private game: Game) {}

  evaluate(attacker: Unit, target: Unit): number {
    let score = 0;

    // Units near our general are threatening
    const generalProximity = this.evaluateGeneralProximity(
      target,
      attacker.player.general
    );
    score += generalProximity;

    // Units that are exposed (near multiple enemies) are easier to eliminate
    const exposureScore = this.evaluateExposure(target);
    score += exposureScore;

    // Units blocking important paths should be prioritized
    const blockingScore = this.evaluateBlocking(target, attacker);
    score += blockingScore;

    return score;
  }

  private evaluateGeneralProximity(threat: Unit, general: Unit): number {
    const distance = this.game.boardSystem.getDistance(threat.position, general.position);

    // Closer = more threatening
    if (distance <= 1) return 25; // Adjacent to general
    if (distance <= 2) return 15; // Very close
    if (distance <= 3) return 8; // Close
    return 0;
  }

  private evaluateExposure(target: Unit): number {
    // Count how many enemy units are nearby
    const nearbyEnemies = target.nearbyUnits.filter(unit => unit.isEnemy(target));

    // More enemies nearby = easier to gang up on = higher priority
    // But this is a positive for us, so we want to attack exposed units
    return nearbyEnemies.length * 5;
  }

  private evaluateBlocking(target: Unit, attacker: Unit): number {
    // Check if target is blocking a direct path to our general
    const general = attacker.player.general;
    const pathResult = attacker.getPathTo(general.position);

    if (!pathResult || pathResult.path.length === 0) return 0;

    // Is the target on the path to our general?
    const isBlocking = pathResult.path.some(point => point.equals(target.position));
    return isBlocking ? 20 : 0;
  }
}
