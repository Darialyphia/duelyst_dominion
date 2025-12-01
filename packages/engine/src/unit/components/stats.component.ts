import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';

export class StatsComponent {
  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  get atk() {
    return this.unit.interceptors.atk.getValue(this.unit.card.atk, {});
  }

  get speed() {
    return this.unit.interceptors.speed.getValue(this.unit.card.speed, {});
  }

  get movementReach() {
    return this.unit.interceptors.movementReach.getValue(
      this.game.config.UNIT_MOVEMENT_REACH,
      {}
    );
  }

  get sprintReach() {
    return this.unit.interceptors.sprintReach.getValue(
      this.game.config.UNIT_SPRINT_REACH,
      {}
    );
  }

  get maxMovementsPerTurn() {
    return this.unit.interceptors.maxMovementsPerTurn.getValue(
      this.game.config.MAX_MOVEMENT_PER_TURN,
      {}
    );
  }

  get maxAttacksPerTurn() {
    return this.unit.interceptors.maxAttacksPerTurn.getValue(
      this.game.config.MAX_ATTACKS_PER_TURN,
      {}
    );
  }

  get maxCounterattacksPerTurn() {
    return this.unit.interceptors.maxCounterattacksPerTurn.getValue(
      this.game.config.MAX_COUNTERATTACKS_PER_TURN,
      {}
    );
  }
}
