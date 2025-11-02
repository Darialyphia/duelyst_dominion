import type { Point } from '@game/shared';
import type { AOEShape } from './aoe-shapes';
import type { BoardCell } from '../board/board-cell.entity';
import type { Unit } from '../unit/unit.entity';

export class CompositeAOEShape implements AOEShape {
  constructor(
    private shapes: Array<{
      shape: AOEShape;
      getPoints: (points: Point[]) => Point[];
    }>
  ) {}

  getCells(points: Point[]) {
    const cells = new Set<BoardCell>();
    this.shapes.forEach(shape => {
      const targets = shape.getPoints(points);
      shape.shape.getCells(targets).forEach(cell => {
        cells.add(cell);
      });
    });

    return [...cells];
  }

  getUnits(points: Point[]) {
    const units = new Set<Unit>();
    this.shapes.forEach(shape => {
      const targets = shape.getPoints(points);
      shape.shape.getUnits(targets).forEach(unit => {
        units.add(unit);
      });
    });

    return [...units];
  }
}
