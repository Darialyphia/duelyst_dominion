import { type Point } from '@game/shared';
import type { BoardCell } from '../board/board-cell.entity';
import type { Unit } from '../unit/unit.entity';

export type AOEShape = {
  getCells(points: Point[]): BoardCell[];
  getUnits(points: Point[]): Unit[];
};
