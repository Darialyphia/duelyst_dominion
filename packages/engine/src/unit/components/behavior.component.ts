import type { Vec2 } from '@game/shared';
import type { Game } from '../../game/game';
import type { BehaviorStrategy } from '../behavior/behavior.strategy';
import type { Unit } from '../unit.entity';

export class BehaviorComponent {
  constructor(
    private game: Game,
    private unit: Unit,
    private strategy: BehaviorStrategy
  ) {}

  private manualIntent: { target: Unit | null; path: Vec2[] } | null = null;

  setManualIntent(intent: { target: Unit | null; path: Vec2[] } | null) {
    this.manualIntent = intent;
  }

  clearManualIntent() {
    this.manualIntent = null;
  }

  findBestTarget() {
    return this.strategy.findBestTarget();
  }

  getIntent() {
    if (this.unit.isGeneral) {
      return this.manualIntent;
    }
    const target = this.findBestTarget();
    const position = this.strategy.findBestPositionToAttack(target);
    const path = this.strategy
      .findBestPathToTarget(position)
      .slice(0, this.unit.movementReach);

    return { target, path };
  }

  async act() {
    const intent = this.getIntent();
    if (!intent) return;

    const destination = intent.path.at(-1);
    if (destination && !destination.equals(this.unit.position)) {
      await this.unit.move(destination);
    }
    if (intent.target && this.unit.canAttackAt(intent.target.position)) {
      await this.unit.attack(intent.target);
    }
  }
}
