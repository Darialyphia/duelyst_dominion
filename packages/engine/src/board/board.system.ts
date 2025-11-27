import {
  indexToPoint,
  isDefined,
  isString,
  Vec2,
  type Point,
  type Serializable
} from '@game/shared';
import { BoardCell } from './entities/board-cell.entity';
import { pointToCellId } from './board-utils';
import { System } from '../system';
import type { MapBlueprint } from './map-blueprint';
import { Shrine } from './entities/shrine.entity';
import { Teleporter } from './entities/two-way-teleporter';

export type BoardSystemOptions = {
  map: MapBlueprint;
};

export type SerializedBoard = {
  rows: number;
  columns: number;
  cells: string[];
  shrines: string[];
  teleporters: string[];
};

export class BoardSystem
  extends System<BoardSystemOptions>
  implements Serializable<SerializedBoard>
{
  map!: MapBlueprint;

  cellsMap = new Map<string, BoardCell>();

  dimensions!: { width: number; height: number };

  shrines!: Shrine[];

  teleporters!: Teleporter[];

  initialize(options: BoardSystemOptions) {
    this.map = options.map;

    this.map.cells.forEach((cellBlueprint, index) => {
      if (!cellBlueprint) return;
      const position = indexToPoint(this.map.cols, index);
      const cell = new BoardCell(this.game, {
        position,
        player: cellBlueprint.player
      });
      this.cellsMap.set(cell.id, cell);
    });

    this.dimensions = {
      width: options.map.cols,
      height: options.map.rows
    };

    this.map.shrinePositions.forEach(pos => {
      const shrine = new Shrine(this.game, Vec2.fromPoint(pos));
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

  get topLeft() {
    return this.getCellAt(this.map.corners.topLeft)!;
  }

  get topRight() {
    return this.getCellAt(this.map.corners.topRight)!;
  }

  get bottomLeft() {
    return this.getCellAt(this.map.corners.bottomLeft)!;
  }

  get bottomRight() {
    return this.getCellAt(this.map.corners.bottomRight)!;
  }

  isInArea(topLeft: Point, size: { width: number; height: number }, point: Point) {
    return (
      point.x >= topLeft.x &&
      point.x < topLeft.x + size.width &&
      point.y >= topLeft.y &&
      point.y < topLeft.y + size.height
    );
  }

  getCellAt(posOrKey: string | Point) {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }
    return this.cellsMap.get(pointToCellId(posOrKey)) ?? null;
  }

  getDistance(from: Point, to: Point) {
    return Vec2.fromPoint(from).dist(to);
  }

  getNeighbors(point: Point) {
    // get neighboring positions in a clockwise order
    return [
      this.getCellAt({ x: point.x - 1, y: point.y - 1 }), // top left
      this.getCellAt({ x: point.x, y: point.y - 1 }), // top
      this.getCellAt({ x: point.x + 1, y: point.y - 1 }), // top right
      this.getCellAt({ x: point.x + 1, y: point.y }), // right
      this.getCellAt({ x: point.x + 1, y: point.y + 1 }), // bottom right
      this.getCellAt({ x: point.x, y: point.y + 1 }), // bottom
      this.getCellAt({ x: point.x - 1, y: point.y + 1 }), // bottom left,
      this.getCellAt({ x: point.x - 1, y: point.y }) // left
    ].filter(isDefined);
  }

  getNearbyShrines({ x, y }: Point) {
    return this.game.boardSystem
      .getNeighbors({ x, y })
      .map(cell => cell.shrine)
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

  isNearby(from: Point, to: Point) {
    return this.getDistance(from, to) == 1;
  }

  serialize(): SerializedBoard {
    return {
      rows: this.height,
      columns: this.width,
      cells: this.cells.map(cell => cell.id),
      shrines: [],
      teleporters: []
    };
  }
}
