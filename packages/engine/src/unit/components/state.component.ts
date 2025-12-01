import type { CombatComponent } from './combat.component';
import type { MovementComponent } from './movement.component';

export class StateComponent {
  private _isExhausted = false;

  constructor(
    private combat: CombatComponent,
    private movement: MovementComponent
  ) {}

  get isExhausted() {
    return this._isExhausted;
  }

  exhaust() {
    this._isExhausted = true;
  }

  wakeUp() {
    this._isExhausted = false;
  }

  activate() {
    this.combat.resetAttackCount();
    this.movement.resetMovementsCount();
    this.wakeUp();
  }
}
