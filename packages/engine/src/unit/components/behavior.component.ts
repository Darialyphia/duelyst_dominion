import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';

export class BehaviorComponent {
  constructor(
    private game: Game,
    private unit: Unit
  ) {}
}
