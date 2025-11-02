import type { SerializedCell } from '../../board/board-cell.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import { MoveUnitAction } from '../actions/move-unit';
import { SelectSpaceOnBoardAction } from '../actions/select-space-on-board';
import { SelectUnitAction } from '../actions/select-unit';
import type { GameClient, GameStateEntities } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { UnitViewModel } from './unit.model';

export type BoardCellClickRule = {
  predicate: (tile: BoardCellViewModel, state: GameClientState) => boolean;
  handler: (tile: BoardCellViewModel) => void;
};

export class BoardCellViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedCell,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: BoardCellViewModel | SerializedCell) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    Object.assign(this.data, data);
  }

  get id() {
    return this.data.id;
  }

  get position() {
    return this.data.position;
  }

  get x() {
    return this.data.position.x;
  }

  get y() {
    return this.data.position.y;
  }

  get isEmpty() {
    return !this.data.unit;
  }

  getUnit() {
    const unit = this.data.unit;
    if (!unit) return null;
    return this.getEntities()[unit] as UnitViewModel;
  }

  private getActions() {
    return [
      new MoveUnitAction(this.getClient()),
      new SelectSpaceOnBoardAction(this.getClient()),
      new SelectUnitAction(this.getClient())
    ];
  }

  getAction() {
    return this.getActions().find(action =>
      action.predicate(this, this.getClient().state)
    );
  }
}
