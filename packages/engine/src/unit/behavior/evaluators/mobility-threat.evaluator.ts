import type { Game } from '../../../game/game';
import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';
import { ZoneCalculator } from '../../zone-calculator';

export class MobilityThreatEvaluator implements ThreatEvaluator {
  readonly weight = 3.0;

  constructor(private game: Game) {}

  evaluate(attacker: Unit, target: Unit): number {
    let score = 0;

    const mobilityScore = this.calculateMobilityScore(target);
    score += mobilityScore;

    const canReachGeneral = this.canAttackGeneral(target, attacker.player.general);
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
    const speedScore = unit.speed * 0.5;

    const reachScore = unit.movementReach * 1.5;

    return speedScore + reachScore;
  }

  private canAttackGeneral(threat: Unit, general: Unit): boolean {
    const zones = new ZoneCalculator(this.game, threat).calculateZones();

    return zones.dangerZone.some(cellId => {
      const cell = this.game.boardSystem.getCellById(cellId);
      return cell?.position.equals(general.position);
    });
  }
}
