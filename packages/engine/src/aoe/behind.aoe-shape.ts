import { isDefined } from '@game/shared';
import type { Point } from 'honeycomb-grid';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import {
  type TargetingType,
  TARGETING_TYPE,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { AOEShape } from './aoe-shapes';
import type { Unit } from '../unit/unit.entity';

export class BehindAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private type: TargetingType = TARGETING_TYPE.ANYWHERE
  ) {}

  getCells(points: Point[]) {
    const unit = this.game.unitSystem.getUnitAt(points[0]);
    if (!isDefined(unit)) return [];

    return [
      unit.player.isPlayer1
        ? this.game.boardSystem.getCellAt({ x: points[0].x - 1, y: points[0].y })
        : this.game.boardSystem.getCellAt({ x: points[0].x + 1, y: points[0].y })
    ].filter(isDefined);
  }

  getUnits(points: Point[]): Unit[] {
    return this.getCells(points)
      .filter(cell => {
        if (!isDefined(cell.unit)) return false;
        return isValidTargetingType(this.game, cell, this.player, this.type);
      })
      .map(cell => cell.unit)
      .filter(isDefined);
  }
}
