import { type Point } from '@game/shared';
import { System } from '../system';
import { Unit } from './unit.entity';
import { MinionCard } from '../card/entities/minion-card.entity';
import type { GeneralCard } from '../card/entities/general-card.entity';
import type { Player } from '../player/player.entity';

// eslint-disable-next-line @typescript-eslint/ban-types
export type UnitSystemOptions = {};

export class UnitSystem extends System<UnitSystemOptions> {
  private unitMap = new Map<string, Unit>();

  private nextUnitId = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize() {}

  shutdown() {}

  get units() {
    return [...this.unitMap.values()];
  }

  get unitsOnBoard() {
    return [...this.unitMap.values()].filter(unit => unit.isAlive);
  }

  getUnitById(id: string) {
    return this.unitMap.get(id) ?? null;
  }

  getUnitByCard(card: MinionCard | GeneralCard) {
    return this.units.find(unit => unit.card.equals(card)) ?? null;
  }

  getUnitsByPlayer(player: Player) {
    return this.units.filter(unit => unit.player.equals(player));
  }

  getUnitAt(position: Point) {
    return (
      this.units.find(e => {
        return e.isAt(position);
      }) ?? null
    );
  }

  getNearbyUnits({ x, y }: Point) {
    // prettier-ignore
    return [
      this.getUnitAt({ x: x - 1, y: y - 1 }), // top left
      this.getUnitAt({ x: x    , y: y - 1 }), // top
      this.getUnitAt({ x: x + 1, y: y - 1 }), // top right
      this.getUnitAt({ x: x - 1, y: y     }),  // left
      this.getUnitAt({ x: x + 1, y: y     }),  // right
      this.getUnitAt({ x: x - 1, y: y + 1 }), // bottom left
      this.getUnitAt({ x: x    , y: y + 1 }), // bottom
      this.getUnitAt({ x: x + 1, y: y + 1 }), // bottom right,
    ].filter
  }

  addUnit(card: MinionCard | GeneralCard, position: Point) {
    const id = `unit_${++this.nextUnitId}`;
    const unit = new Unit(this.game, card, { id, position });
    this.unitMap.set(unit.id, unit);

    return unit;
  }

  removeUnit(unit: Unit) {
    this.unitMap.delete(unit.id);
    if (unit.card instanceof MinionCard) {
      unit.player.cardManager.sendToDiscardPile(unit.card);
    }
  }

  getUnitDirectlyBehind(unit: Unit) {
    const { x, y } = unit.position;
    if (unit.player.isPlayer1) {
      return this.getUnitAt({ x: x - 1, y });
    } else {
      return this.getUnitAt({ x: x + 1, y });
    }
  }

  getClosestUnitBehind(unit: Unit) {
    if (unit.player.isPlayer1) {
      for (let x = unit.position.x - 1; x >= 0; x--) {
        const unitAt = this.getUnitAt({ x, y: unit.position.y });
        if (unitAt) {
          return unitAt;
        }
      }
    } else {
      for (let x = unit.position.x + 1; x < this.game.boardSystem.map.cols; x++) {
        const unitAt = this.getUnitAt({ x, y: unit.position.y });
        if (unitAt) {
          return unitAt;
        }
      }
    }
  }

  getUnitDirectlyInFront(unit: Unit) {
    const { x, y } = unit.position;
    if (unit.player.isPlayer1) {
      return this.getUnitAt({ x: x + 1, y });
    } else {
      return this.getUnitAt({ x: x - 1, y });
    }
  }

  getClosestUnitInFront(unit: Unit) {
    if (unit.player.isPlayer1) {
      for (let x = unit.position.x + 1; x < this.game.boardSystem.map.cols; x++) {
        const unitAt = this.getUnitAt({ x, y: unit.position.y });
        if (unitAt) {
          return unitAt;
        }
      }
    } else {
      for (let x = unit.position.x - 1; x >= 0; x--) {
        const unitAt = this.getUnitAt({ x, y: unit.position.y });
        if (unitAt) {
          return unitAt;
        }
      }
    }
  }

  getUnitDirectlyAbove(unit: Unit) {
    const { x, y } = unit.position;
    return this.getUnitAt({ x, y: y - 1 });
  }

  getClosestUnitAbove(unit: Unit) {
    for (let y = unit.position.y - 1; y >= 0; y--) {
      const unitAt = this.getUnitAt({ x: unit.position.x, y });
      if (unitAt) {
        return unitAt;
      }
    }
  }

  getUnitDirectlyBelow(unit: Unit) {
    const { x, y } = unit.position;
    return this.getUnitAt({ x, y: y + 1 });
  }

  getClosestUnitBelow(unit: Unit) {
    for (let y = unit.position.y + 1; y < this.game.boardSystem.map.rows; y++) {
      const unitAt = this.getUnitAt({ x: unit.position.x, y });
      if (unitAt) {
        return unitAt;
      }
    }
  }
}
