import { assert, isDefined, type Point } from '@game/shared';
import { IllegalTargetError } from '../../input/input-errors';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import type { GenericAOEShape } from '../../aoe/aoe-shape';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import { InvalidPlayerError, UnableToCommitError } from '../game-error';

type SelectingSpaceOnBoardContextOptions = {
  player: Player;
  isElligible: (space: BoardCell, selectedSpaces: BoardCell[]) => boolean;
  canCommit: (selectedSpaces: BoardCell[]) => boolean;
  getAoe: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
  isDone(selectedSpaces: BoardCell[]): boolean;
};

export class SelectingSpaceOnBoardContext {
  static async create(game: Game, options: SelectingSpaceOnBoardContextOptions) {
    const instance = new SelectingSpaceOnBoardContext(game, options);
    await instance.init();
    return instance;
  }
  private selectedSpaces: BoardCell[] = [];

  private isElligible: (space: BoardCell, selectedSpaces: BoardCell[]) => boolean;

  private canCommit: (selectedSpaces: BoardCell[]) => boolean;

  private isDone: (selectedSpaces: BoardCell[]) => boolean;

  private getAoe: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;

  readonly player: Player;

  private constructor(
    private game: Game,
    options: SelectingSpaceOnBoardContextOptions
  ) {
    this.player = options.player;
    this.isElligible = options.isElligible;
    this.canCommit = options.canCommit;
    this.isDone = options.isDone;
    this.getAoe = options.getAoe;
  }

  serialize() {
    return {
      player: this.player.id,
      selectedSpaces: this.selectedSpaces.map(space => space.id),
      elligibleSpaces: this.game.boardSystem.cells
        .filter(cell => this.isElligible(cell, this.selectedSpaces))
        .map(space => space.id),
      canCommit: this.canCommit(this.selectedSpaces),
      aoe: this.getSerializedAoe()
    };
  }

  async init() {}

  private getSerializedAoe() {
    const spaces = this.selectedSpaces;

    const canCommit = this.canCommit(spaces);
    if (!canCommit) {
      return {
        cells: [],
        units: []
      };
    }
    const aoe = this.getAoe(spaces);
    if (!aoe) {
      return {
        cells: [],
        units: []
      };
    }

    return {
      cells: aoe
        .getArea(spaces)
        .map(point => this.game.boardSystem.getCellAt(point)?.id)
        .filter(isDefined),
      units: aoe
        .getArea(spaces)
        .map(point => this.game.unitSystem.getUnitAt(point)?.id)
        .filter(isDefined)
    };
  }

  private async autoCommitIfAble() {
    const isDone = this.isDone(this.selectedSpaces);
    const canCommit = this.canCommit(this.selectedSpaces);
    if (isDone && canCommit) {
      this.commit(this.player);
    } else {
      await this.game.inputSystem.askForPlayerInput();
    }
  }

  async selectSpace(player: Player, space: Point) {
    assert(player.equals(this.player), new InvalidPlayerError());
    const cell = this.game.boardSystem.getCellAt(space);
    assert(cell, new IllegalTargetError());
    assert(this.isElligible(cell, this.selectedSpaces), new IllegalTargetError());
    this.selectedSpaces.push(cell);
    await this.autoCommitIfAble();
  }

  commit(player: Player) {
    assert(this.canCommit, new UnableToCommitError());
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(
      INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_SPACE_ON_BOARD
    );
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedSpaces);
  }

  cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause([]);
  }
}
