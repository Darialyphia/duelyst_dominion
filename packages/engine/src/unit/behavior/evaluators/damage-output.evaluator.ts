import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';

export class DamageOutputEvaluator implements ThreatEvaluator {
  readonly weight = 5.0;

  evaluate(attacker: Unit, target: Unit): number {
    let score = target.atk;

    const aoeMultiplier = this.getAOEMultiplier(target);
    score *= aoeMultiplier;

    score *= target.maxAttacksPerTurn - 1;

    return score;
  }

  private getAOEMultiplier(target: Unit): number {
    const aoeSize = target.attackAOEShape.getArea([target.position]).length;

    return 1 + (aoeSize - 1) * 0.2;
  }
}
