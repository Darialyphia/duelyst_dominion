import {
  isDefined,
  type EmptyObject,
  type MaybePromise,
  type Values
} from '@game/shared';
import type { InputDispatcher, SerializedInput } from '../input/input-system';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState,
  SnapshotDiff
} from '../game/systems/game-snapshot.system';
import { ModifierViewModel } from './view-models/modifier.model';
import { CardViewModel } from './view-models/card.model';
import { PlayerViewModel } from './view-models/player.model';
import { FxController } from './controllers/fx-controller';
import { ClientStateController } from './controllers/state-controller';
import { UiController } from './controllers/ui-controller';
import { TypedEventEmitter } from '../utils/typed-emitter';
import type { BoardCellViewModel } from './view-models/board-cell.model';
import type { UnitViewModel } from './view-models/unit.model';
import type { TileViewModel } from './view-models/tile.model';
import { GAME_PHASES } from '../game/game.enums';
import type { TeleporterViewModel } from './view-models/teleporter.model';
import type { ShrineViewModel } from './view-models/shrine.model';
import type { Rune } from '../card/card.enums';

export const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameStateEntities = Record<
  string,
  | PlayerViewModel
  | CardViewModel
  | ModifierViewModel
  | BoardCellViewModel
  | UnitViewModel
  | TileViewModel
  | ShrineViewModel
  | TeleporterViewModel
>;

export type OnSnapshotUpdateCallback = (
  snapshot: GameStateSnapshot<SnapshotDiff>
) => MaybePromise<void>;

export type NetworkAdapter = {
  dispatch: InputDispatcher;
  subscribe(cb: OnSnapshotUpdateCallback): void;
  sync: (lastSnapshotId: number) => Promise<Array<GameStateSnapshot<SnapshotDiff>>>;
};

export type FxAdapter = {
  onDeclarePlayCard: (card: CardViewModel, client: GameClient) => MaybePromise<void>;
  onCancelPlayCard: (card: CardViewModel, client: GameClient) => MaybePromise<void>;
};

export type GameClientOptions = {
  networkAdapter: NetworkAdapter;
  fxAdapter: FxAdapter;
  gameType: GameType;
  playerId: string;
  isSpectator: boolean;
};

export class GameClient {
  readonly fx = new FxController();

  readonly stateManager: ClientStateController;

  readonly ui: UiController;

  readonly networkAdapter: NetworkAdapter;

  readonly fxAdapter: FxAdapter;

  readonly gameType: GameType;

  private initialState!: SerializedOmniscientState | SerializedPlayerState;

  playerId: string;

  private lastSnapshotId = -1;

  private snapshots = new Map<number, GameStateSnapshot<SnapshotDiff>>();

  private _isPlayingFx = false;

  public isReady = false;

  private _processingUpdate = false;

  private queue: Array<GameStateSnapshot<SnapshotDiff>> = [];

  history: SerializedInput[] = [];

  private emitter = new TypedEventEmitter<{
    update: EmptyObject;
    updateCompleted: GameStateSnapshot<SnapshotDiff>;
  }>('sequential');

  readonly isSpectator: boolean = false;
  constructor(options: GameClientOptions) {
    this.networkAdapter = options.networkAdapter;
    this.fxAdapter = options.fxAdapter;
    this.stateManager = new ClientStateController(this);
    this.ui = new UiController(this);
    this.gameType = options.gameType;
    this.playerId = options.playerId;
    this.isSpectator = options.isSpectator;

    this.networkAdapter.subscribe(async snapshot => {
      console.groupCollapsed(`Snapshot Update: ${snapshot.id}`);
      if (snapshot.kind === 'state') {
        console.log('state', snapshot.state);
      }
      console.log('events', snapshot.events);
      console.groupEnd();
      this.queue.push(snapshot);
      if (this._processingUpdate) return;
      await this.processQueue();
    });

    this.cancelPlayCard = this.cancelPlayCard.bind(this);
  }

  get isPlayingFx() {
    return this._isPlayingFx;
  }

  get state() {
    return this.stateManager.state;
  }

  get player() {
    return this.stateManager.state.entities[this.playerId] as PlayerViewModel;
  }

  get nextSnapshotId() {
    return this.lastSnapshotId + 1;
  }

  private async processQueue() {
    if (this._processingUpdate || this.queue.length === 0) {
      console.warn('Already processing updates or queue is empty, skipping processing.');
      return;
    }

    this._processingUpdate = true;

    while (this.queue.length > 0) {
      const snapshot = this.queue.shift();
      await this.update(snapshot!);
    }

    this._processingUpdate = false;
  }

  getActivePlayerIdFromSnapshotState(
    snapshot: SerializedOmniscientState | SerializedPlayerState
  ) {
    return snapshot.interaction.ctx.player;
  }

  getActivePlayerId() {
    return this.stateManager.state.interaction.ctx.player;
  }

  async initialize(
    snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>,
    history: SerializedInput[] = []
  ) {
    this.isReady = false;
    this.history = history;
    this.lastSnapshotId = -1;
    this.snapshots.clear();
    this.queue = [];
    if (snapshot.kind === 'error') {
      throw new Error('Cannot initialize client with error snapshot');
    }

    this.lastSnapshotId = snapshot.id;
    this.initialState = snapshot.state;

    this.stateManager.initialize(snapshot.state);

    this.isReady = true;
    if (this.queue.length > 0) {
      await this.processQueue();
    }
  }

  async onInvalidSnapshot() {
    this.queue = [];
    await this.sync();
  }

  async update(snapshot: GameStateSnapshot<SnapshotDiff>) {
    if (snapshot.id <= this.lastSnapshotId) {
      console.log(
        `Stale snapshot, latest is ${this.lastSnapshotId}, received is ${snapshot.id}. skipping`
      );
      return;
    }

    if (snapshot.id > this.nextSnapshotId) {
      console.warn(
        `Missing snapshots, latest is ${this.lastSnapshotId}, received is ${snapshot.id}`
      );
      return await this.onInvalidSnapshot();
    }

    this.lastSnapshotId = snapshot.id;

    try {
      this._isPlayingFx = true;
      const isStateSnapshot = snapshot.kind === 'state';
      if (isStateSnapshot) {
        this.stateManager.preupdate(snapshot.state);
      }

      // console.group(`Processing events for snapshot ${snapshot.id}`);
      // if (snapshot.events.length === 0) {
      //   console.log('No events in this snapshot');
      // }
      // snapshot.events.forEach(event => {
      //   console.log(event.eventName);
      // });
      // console.groupEnd();
      for (const event of snapshot.events) {
        await this.stateManager.onEvent(event, async postUpdateCallback => {
          await this.emitter.emit('update', {});
          await postUpdateCallback?.();
        });

        await this.fx.emit(event.eventName, event.event);
      }
      this._isPlayingFx = false;

      if (isStateSnapshot) {
        this.stateManager.update(snapshot.state);
      }

      this.ui.update();
      this.snapshots.set(snapshot.id, snapshot);
      await this.emitter.emit('update', {});
      await this.emitter.emit('updateCompleted', snapshot);
    } catch (err) {
      console.error(err);
    }
  }

  onUpdate(cb: () => void) {
    this.emitter.on('update', cb);
  }

  onUpdateCompleted(cb: (snapshot: GameStateSnapshot<SnapshotDiff>) => void) {
    this.emitter.on('updateCompleted', cb);
    return () => this.emitter.off('updateCompleted', cb);
  }

  private async sync() {
    const snapshots = await this.networkAdapter.sync(this.lastSnapshotId);
    this.queue.push(...snapshots);
  }

  endTurn() {
    this.networkAdapter.dispatch({
      type: 'endTurn',
      payload: { playerId: this.playerId }
    });
  }

  cancelPlayCard() {
    if (this.state.phase.state !== GAME_PHASES.PLAYING_CARD) return;

    this.networkAdapter.dispatch({
      type: 'cancelPlayCard',
      payload: { playerId: this.state.turnPlayer }
    });
    const playedCard = this.state.entities[this.state.phase.ctx.card] as CardViewModel;

    void this.fxAdapter.onCancelPlayCard(playedCard, this);
  }

  commitSpaceSelection() {
    this.networkAdapter.dispatch({
      type: 'commitSpaceSelection',
      payload: {
        playerId: this.playerId
      }
    });
  }

  chooseCards(indices: number[]) {
    this.networkAdapter.dispatch({
      type: 'chooseCards',
      payload: {
        playerId: this.playerId,
        indices
      }
    });
  }

  gainRune(rune: Rune) {
    this.networkAdapter.dispatch({
      type: 'useResourceAction',
      payload: {
        playerId: this.playerId,
        type: 'gain-rune',
        rune
      }
    });
  }

  drawCard() {
    this.networkAdapter.dispatch({
      type: 'useResourceAction',
      payload: {
        playerId: this.playerId,
        type: 'draw-card'
      }
    });
  }

  replaceCard(card: CardViewModel) {
    if (!isDefined(card.indexInHand)) return;

    this.networkAdapter.dispatch({
      type: 'replaceCard',
      payload: {
        playerId: this.playerId,
        index: card.indexInHand
      }
    });
  }
}
