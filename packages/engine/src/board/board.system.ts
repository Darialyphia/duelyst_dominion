import {
  indexToPoint,
  isDefined,
  isString,
  type Point,
  type Serializable
} from '@game/shared';
import { BoardCell } from './entities/board-cell.entity';
import { pointToCellId } from './board-utils';
import { System } from '../system';
import type { MapBlueprint } from './map-blueprint';
import { defineHex, Grid, Orientation, rectangle, spiral } from 'honeycomb-grid';
import { Shrine } from './entities/shrine.entity';
import { Position } from '../utils/position';
import { Teleporter } from './entities/two-way-teleporter';

export type BoardSystemOptions = {
  map: MapBlueprint;
};

export type SerializedBoard = {
  rows: number;
  columns: number;
  cells: string[];
};

export const BoardHex = defineHex({
  dimensions: {
    width: 10,
    height: 10
  },
  orientation: Orientation.FLAT
});

type HexGrid = Grid<InstanceType<typeof BoardHex>>;

export class BoardSystem
  extends System<BoardSystemOptions>
  implements Serializable<SerializedBoard>
{
  map!: MapBlueprint;

  grid!: HexGrid;

  cellsMap = new Map<string, BoardCell>();

  dimensions!: { width: number; height: number };

  shrines!: Shrine[];

  teleporters!: Teleporter[];

  initialize(options: BoardSystemOptions) {
    this.map = options.map;

    this.grid = new Grid(
      BoardHex,
      rectangle({ width: this.map.cols, height: this.map.rows })
    );

    this.map.cells.forEach((cellBlueprint, index) => {
      if (!cellBlueprint) return;
      const position = indexToPoint(this.map.cols, index);
      const cell = new BoardCell(this.game, {
        position,
        player: cellBlueprint.player,
        hex: this.grid.createHex({ col: position.x, row: position.y })
      });
      this.cellsMap.set(cell.id, cell);
    });

    this.dimensions = {
      width: options.map.cols,
      height: options.map.rows
    };

    this.map.shrinePositions.forEach(pos => {
      const shrine = new Shrine(this.game, Position.fromPoint(pos));
      this.shrines = [...(this.shrines || []), shrine];
    });

    this.map.teleporters.forEach(teleporterData => {
      const teleporter = new Teleporter(
        this.game,
        teleporterData.id,
        teleporterData.gates,
        teleporterData.color
      );
      this.teleporters = [...(this.teleporters || []), teleporter];
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  shutdown() {}

  get width() {
    return this.map.cols;
  }

  get height() {
    return this.map.rows;
  }

  get cells() {
    return [...this.cellsMap.values()];
  }

  getCellAt(posOrKey: string | Point) {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }
    return this.cellsMap.get(pointToCellId(posOrKey)) ?? null;
  }

  getDistance(from: Point, to: Point) {
    return this.grid.distance({ col: from.x, row: from.y }, { col: to.x, row: to.y });
  }

  getNeighbors(point: Point) {
    return this.grid
      .traverse(spiral({ radius: 1, start: { col: point.x, row: point.y } }))
      .toArray()
      .map(hex => {
        return this.getCellAt({ x: hex.col, y: hex.row });
      })
      .filter(isDefined);
  }

  getCellsWithin(topLeft: Point, bottomRight: Point) {
    return [...this.cellsMap.values()].filter(
      cell =>
        cell.x >= topLeft.x &&
        cell.x <= bottomRight.x &&
        cell.y >= topLeft.y &&
        cell.y <= bottomRight.y
    );
  }

  serialize(): SerializedBoard {
    return {
      rows: this.height,
      columns: this.width,
      cells: this.cells.map(cell => cell.id)
    };
  }
}
