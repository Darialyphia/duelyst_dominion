import type { Nullable, Point, Vec2 } from '@game/shared';
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
import { Z } from 'vitest/dist/chunks/reporters.nr4dxCkA.js';
import { ZoneCalculator } from '../zone-calculator';

export class DefaultBehaviorStrategy implements BehaviorStrategy {
  private threatEvaluator: CompositeThreatEvaluator;

  constructor(
    private game: Game,
    private unit: Unit
  ) {
    // Compose all evaluators with their weights
    this.threatEvaluator = new CompositeThreatEvaluator([
      new LethalThreatEvaluator(game),
      new TradeEvaluator(),
      new DamageOutputEvaluator(),
      new ValueEvaluator(),
      new MobilityThreatEvaluator(game),
      new PositionalThreatEvaluator(game)
    ]);
  }

  private getWeightForAttackableUnit(target: Unit): number {
    return this.threatEvaluator.evaluate(this.unit, target);
  }

  private getAttackTargetsRanking(): Unit[] {
    return this.unit.player.opponent.units
      .filter(target => this.isValidTarget(target))
      .sort(
        (a, b) => this.getWeightForAttackableUnit(b) - this.getWeightForAttackableUnit(a)
      );
  }

  private isValidTarget(target: Unit): boolean {
    if (!target.isAlive) return false;

    return true;
  }

  findBestTarget(): Unit {
    const rankedTargets = this.getAttackTargetsRanking();
    return rankedTargets[0] || this.unit.player.opponent.general;
  }

  findBestPositionToAttack(target: Unit) {
    const { dangerZone } = new ZoneCalculator(this.game, this.unit).calculateZones();
    const attackPositions = dangerZone
      .map(cellId => {
        return this.game.boardSystem.getCellById(cellId)!;
      })
      .filter(cell => {
        return this.unit.isWithinDangerZone(target.position, cell.position);
      });

    const canAttackFromCurrentPosition = attackPositions.some(cell =>
      cell.position.equals(this.unit.position)
    );
    if (canAttackFromCurrentPosition) {
      return this.unit.position;
    }

    // temporary - let's calculate a more optimal attack angle later (ie: optimize frenzy damage etc)
    return attackPositions[0]?.position ?? null;
  }

  findBestPathToTarget(point: Point) {
    return this.unit.getPathTo(point)!.path;
  }
}
