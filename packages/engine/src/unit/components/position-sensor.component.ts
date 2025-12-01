import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';
import type { BoardCell } from '../../board/entities/board-cell.entity';

export class PositionSensorComponent {
  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  get inFront(): BoardCell | null {
    return this.game.boardSystem.getCellAt({
      x: this.unit.player.isPlayer1 ? this.unit.x + 1 : this.unit.x - 1,
      y: this.unit.y
    });
  }

  get behind(): BoardCell | null {
    return this.game.boardSystem.getCellAt({
      x: this.unit.player.isPlayer1 ? this.unit.x - 1 : this.unit.x + 1,
      y: this.unit.y
    });
  }

  get above(): BoardCell | null {
    return this.game.boardSystem.getCellAt({
      x: this.unit.x,
      y: this.unit.y - 1
    });
  }

  get below(): BoardCell | null {
    return this.game.boardSystem.getCellAt({
      x: this.unit.x,
      y: this.unit.y + 1
    });
  }

  get nearbyUnits(): Unit[] {
    return this.game.unitSystem.getNearbyUnits(this.unit.position);
  }
}
