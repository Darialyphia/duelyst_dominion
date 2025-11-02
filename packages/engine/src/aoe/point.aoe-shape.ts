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

export class PointAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private type: TargetingType = TARGETING_TYPE.ANYWHERE
  ) {}

  getCells(points: Point[]) {
    return points.map(point => this.game.boardSystem.getCellAt(point)).filter(isDefined);
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
