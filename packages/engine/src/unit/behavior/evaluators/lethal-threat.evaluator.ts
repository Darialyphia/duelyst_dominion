import type { Game } from '../../../game/game';
import type { Unit } from '../../unit.entity';
import type { ThreatEvaluator } from './threat-evaluator';
import { ZoneCalculator } from '../../zone-calculator';
import { CombatDamage } from '../../../utils/damage';

/**
 * TIER 1 - CRITICAL THREATS (highest priority)
 * Evaluates immediate lethal threats to self or general.
 */
export class LethalThreatEvaluator implements ThreatEvaluator {
  readonly weight = 10.0;

  constructor(private game: Game) {}

  evaluate(attacker: Unit, target: Unit): number {
    let score = 0;

    // CRITICAL: Can I kill their general?
    if (target.isGeneral && this.canKillTarget(attacker, target)) {
      return 100; // Game-winning move
    }

    // CRITICAL: Can this target kill my general this turn?
    if (this.canKillThisTurn(target, attacker.player.general)) {
      score += 95; // Must eliminate this threat
    }

    if (this.wouldDieToCounterattack(attacker, target)) {
      score -= 25; // Negative score = bad idea (unless other factors outweigh)
    }

    return score;
  }

  private canKillTarget(attacker: Unit, target: Unit): boolean {
    const damage = new CombatDamage(attacker).getFinalAmount(target);
    return damage >= target.remainingHp;
  }

  private canKillThisTurn(threat: Unit, victim: Unit): boolean {
    if (threat.isExhausted) return false;

    const zones = new ZoneCalculator(this.game, threat).calculateZones();
    const canReach = zones.dangerZone.some(cellId => {
      const cell = this.game.boardSystem.getCellById(cellId);
      return cell?.position.equals(victim.position);
    });

    if (!canReach) return false;

    return this.canKillTarget(threat, victim);
  }

  private wouldDieToCounterattack(attacker: Unit, target: Unit): boolean {
    if (!target.canCounterAttack(attacker)) return false;
    if (!attacker.canBeCounterattackedBy(target)) return false;

    const counterDamage = new CombatDamage(target).getFinalAmount(attacker);
    return counterDamage >= attacker.remainingHp;
  }
}
