import type { Game } from '../../../game/game';
import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';

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

    const exposureScore = this.evaluateExposure(target);
    score += exposureScore;

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
    const nearbyEnemies = target.nearbyUnits.filter(unit => unit.isEnemy(target));

    return nearbyEnemies.length * 5;
  }
}
