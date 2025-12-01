import type { Game } from '../../../game/game';
import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';
import { ZoneCalculator } from '../../zone-calculator';

/**
 * TIER 3-4: Evaluates mobility and positioning threats.
 * Fast units that can reach important targets are more dangerous.
 */
export class MobilityThreatEvaluator implements ThreatEvaluator {
  readonly weight = 3.0;

  constructor(private game: Game) {}

  evaluate(attacker: Unit, target: Unit): number {
    let score = 0;

    // Base mobility score from speed and movement range
    const mobilityScore = this.calculateMobilityScore(target);
    score += mobilityScore;

    // Units that can reach our general are much more threatening
    const canReachGeneral = this.canEventuallyReachGeneral(
      target,
      attacker.player.general
    );
    if (canReachGeneral) {
      score += 20;
    }

    // Units already near our general are immediate threats
    const distanceToGeneral = this.game.boardSystem.getDistance(
      target.position,
      attacker.player.general.position
    );
    if (distanceToGeneral <= 2) {
      score += 15;
    }

    return score;
  }

  private calculateMobilityScore(unit: Unit): number {
    // Speed indicates how quickly they can reposition
    const speedScore = unit.speed * 2;

    // Movement reach indicates how far they can go in one turn
    const reachScore = unit.movementReach * 1.5;

    return speedScore + reachScore;
  }

  private canEventuallyReachGeneral(threat: Unit, general: Unit): boolean {
    // Check if the threat's danger zone can include the general's position
    // This considers potential movement + attack range
    const zones = new ZoneCalculator(this.game, threat).calculateZones();

    return zones.dangerZone.some(cellId => {
      const cell = this.game.boardSystem.getCellById(cellId);
      return cell?.position.equals(general.position);
    });
  }
}
