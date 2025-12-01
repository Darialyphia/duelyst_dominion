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

    // CRITICAL: Can this target kill my general next turn?
    if (this.canKillGeneralNextTurn(target, attacker.player.general)) {
      score += 95; // Must eliminate this threat
    }

    // CRITICAL: Can this target kill me next turn?
    if (this.canKillNextTurn(target, attacker)) {
      score += 90; // High priority to eliminate before they can
    }

    // WARNING: Would I die to counterattack if I attack them?
    if (this.wouldDieToCounterattack(attacker, target)) {
      score -= 50; // Negative score = bad idea (unless other factors outweigh)
    }

    return score;
  }

  private canKillTarget(attacker: Unit, target: Unit): boolean {
    const damage = new CombatDamage(attacker).getFinalAmount(target);
    return damage >= target.remainingHp;
  }

  private canKillNextTurn(threat: Unit, victim: Unit): boolean {
    // Exhausted units can't attack next turn
    if (threat.isExhausted) return false;

    // Check if threat can reach victim
    const zones = new ZoneCalculator(this.game, threat).calculateZones();
    const canReach = zones.dangerZone.some(cellId => {
      const cell = this.game.boardSystem.getCellById(cellId);
      return cell?.position.equals(victim.position);
    });

    if (!canReach) return false;

    // Check if threat would deal lethal damage
    const damage = new CombatDamage(threat).getFinalAmount(victim);
    return damage >= victim.remainingHp;
  }

  private canKillGeneralNextTurn(threat: Unit, general: Unit): boolean {
    return this.canKillNextTurn(threat, general);
  }

  private wouldDieToCounterattack(attacker: Unit, target: Unit): boolean {
    // Check if target can counterattack
    if (!target.canCounterAttack(attacker)) return false;
    if (!attacker.canBeCounterattackedBy(target)) return false;

    // Check if counterattack would be lethal
    const counterDamage = new CombatDamage(target).getFinalAmount(attacker);
    return counterDamage >= attacker.remainingHp;
  }
}
