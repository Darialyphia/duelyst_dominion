import { isDefined } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import type { Game } from '../game/game';
import {
  type TargetingType,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { AOEShape } from './aoe-shapes';
import type { BoardCell } from '../board/board-cell.entity';
import type { Unit } from '../unit/unit.entity';

export class EverywhereAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private card: AnyCard,
    private type: TargetingType
  ) {}

  getCells(): BoardCell[] {
    return this.game.boardSystem.cells;
  }

  getUnits(): Unit[] {
    return this.getCells()
      .map(cell => cell.unit)
      .filter((unit): unit is Unit => {
        if (!isDefined(unit)) return false;

        return isValidTargetingType(
          this.game,
          unit.position,
          this.card.player,
          this.type
        );
      });
  }
}
