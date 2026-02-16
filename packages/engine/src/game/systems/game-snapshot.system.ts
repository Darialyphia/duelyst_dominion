import { System } from '../../system';
import {
  GAME_EVENTS,
  GameNewSnapshotEvent,
  type GameEventName,
  type GameStarEvent,
  type SerializedStarEvent
} from '../game.events';
import { GAME_PHASES } from '../game.enums';
import {
  GameSerializer,
  type SerializedOmniscientState,
  type SerializedPlayerState,
  type SnapshotDiff
} from './game-serializer';
import type { PatchBasedSnapshotDiff } from './patch-types';

// Re-export types for convenience
export type { SerializedOmniscientState, SerializedPlayerState, SnapshotDiff };
export type { PatchBasedSnapshotDiff };

export type GameStateSnapshot<T> =
  | {
      id: number;
      state: T;
      events: SerializedStarEvent[];
      kind: 'state';
    }
  | {
      id: number;
      events: SerializedStarEvent[];
      kind: 'error';
    };

export class GameSnapshotSystem extends System<{ enabled: boolean }> {
  private isEnabled = true;
  private serializer!: GameSerializer;

  private playerCaches: Record<string, GameStateSnapshot<SerializedPlayerState>[]> = {
    omniscient: []
  };
  private omniscientCache: GameStateSnapshot<SerializedOmniscientState>[] = [];

  private eventsSinceLastSnapshot: GameStarEvent[] = [];

  private nextId = 0;

  initialize({ enabled }: { enabled: boolean }): void {
    this.isEnabled = enabled;
    this.serializer = new GameSerializer(this.game);
    this.serializer.initialize();

    const ignoredEvents: GameEventName[] = [
      GAME_EVENTS.NEW_SNAPSHOT,
      GAME_EVENTS.FLUSHED,
      GAME_EVENTS.INPUT_START,
      GAME_EVENTS.INPUT_END
    ];
    this.playerCaches[this.game.playerSystem.player1.id] = [];
    this.playerCaches[this.game.playerSystem.player2.id] = [];

    this.game.on(
      '*',
      event => {
        if (ignoredEvents.includes(event.data.eventName)) return;
        if (!this.isEnabled) return;
        this.eventsSinceLastSnapshot.push(event);
      },
      100
    );
  }

  shutdown() {}

  getOmniscientSnapshotAt(index: number): GameStateSnapshot<SerializedOmniscientState> {
    const snapshot = this.omniscientCache[index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  getSnapshotForPlayerAt(
    playerId: string,
    index: number
  ): GameStateSnapshot<SerializedPlayerState> {
    const snapshot = this.playerCaches[playerId][index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  private diffSnapshot<T extends SerializedOmniscientState | SerializedPlayerState>(
    snapshot: GameStateSnapshot<T> & { kind: 'state' },
    prevSnapshot: GameStateSnapshot<T>
  ): GameStateSnapshot<SnapshotDiff> & { kind: 'state' } {
    return {
      ...snapshot,
      state:
        prevSnapshot.kind === 'error'
          ? {
              ...snapshot.state,
              removedEntities: [],
              addedEntities: Object.keys(snapshot.state.entities)
            }
          : this.serializer.diffSnapshots(snapshot.state, prevSnapshot.state)
    };
  }

  getLatestOmniscientSnapshot(): GameStateSnapshot<SerializedOmniscientState> {
    return this.getOmniscientSnapshotAt(this.nextId - 1);
  }

  getOmniscientDiffSnapshotAt(index: number): GameStateSnapshot<SnapshotDiff> {
    const snapshot = this.getOmniscientSnapshotAt(index);
    if (snapshot.kind === 'error') {
      return snapshot;
    }

    if (index < 1) {
      return {
        ...snapshot,
        state: {
          removedEntities: [],
          addedEntities: Object.keys(snapshot.state.entities),
          ...snapshot.state
        }
      };
    }
    const previousSnapshot = this.getOmniscientSnapshotAt(index - 1);

    return this.diffSnapshot(snapshot, previousSnapshot);
  }

  getLatestSnapshotForPlayer(playerId: string): GameStateSnapshot<SerializedPlayerState> {
    return this.getSnapshotForPlayerAt(playerId, this.nextId - 1);
  }

  getDiffSnapshotForPlayerAt(
    playerId: string,
    index: number
  ): GameStateSnapshot<SnapshotDiff> {
    const latestSnapshot = this.getSnapshotForPlayerAt(playerId, index);
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (index < 1) {
      return {
        ...latestSnapshot,
        state: {
          removedEntities: [],
          addedEntities: Object.keys(latestSnapshot.state.entities),
          ...latestSnapshot.state
        }
      };
    }
    const previousSnapshot = this.getOmniscientSnapshotAt(index - 1);
    return this.diffSnapshot(latestSnapshot, previousSnapshot);
  }

  getLatestOmniscientPatchDiffSnapshot(): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const latestSnapshot = this.getLatestOmniscientSnapshot();
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (this.nextId < 2) {
      // First snapshot - all entities are "added"
      return {
        ...latestSnapshot,
        state: {
          entityPatches: {},
          addedEntities: latestSnapshot.state.entities,
          removedEntities: [],
          phase: latestSnapshot.state.phase,
          interaction: latestSnapshot.state.interaction,
          board: latestSnapshot.state.board,
          turnCount: latestSnapshot.state.turnCount,
          players: latestSnapshot.state.players,
          config: latestSnapshot.state.config,
          tiles: latestSnapshot.state.tiles,
          units: latestSnapshot.state.units,
          turnPlayer: latestSnapshot.state.turnPlayer
        }
      };
    }

    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              entityPatches: {},
              addedEntities: latestSnapshot.state.entities,
              removedEntities: [],
              phase: latestSnapshot.state.phase,
              interaction: latestSnapshot.state.interaction,
              board: latestSnapshot.state.board,
              turnCount: latestSnapshot.state.turnCount,
              players: latestSnapshot.state.players,
              config: latestSnapshot.state.config,
              tiles: latestSnapshot.state.tiles,
              units: latestSnapshot.state.units,
              turnPlayer: latestSnapshot.state.turnPlayer
            }
          : this.serializer.diffSnapshotsWithPatches(
              latestSnapshot.state,
              previousSnapshot.state
            )
    };
  }

  getOmniscientPatchDiffSnapshotAt(
    index: number
  ): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const latestSnapshot = this.getOmniscientSnapshotAt(index);
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (index < 1) {
      return {
        ...latestSnapshot,
        state: {
          entityPatches: {},
          addedEntities: latestSnapshot.state.entities,
          removedEntities: [],
          phase: latestSnapshot.state.phase,
          interaction: latestSnapshot.state.interaction,
          board: latestSnapshot.state.board,
          turnCount: latestSnapshot.state.turnCount,
          players: latestSnapshot.state.players,
          config: latestSnapshot.state.config,
          tiles: latestSnapshot.state.tiles,
          units: latestSnapshot.state.units,
          turnPlayer: latestSnapshot.state.turnPlayer
        }
      };
    }

    const previousSnapshot = this.getOmniscientSnapshotAt(index - 1);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              entityPatches: {},
              addedEntities: latestSnapshot.state.entities,
              removedEntities: [],
              phase: latestSnapshot.state.phase,
              interaction: latestSnapshot.state.interaction,
              board: latestSnapshot.state.board,
              turnCount: latestSnapshot.state.turnCount,
              players: latestSnapshot.state.players,
              config: latestSnapshot.state.config,
              tiles: latestSnapshot.state.tiles,
              units: latestSnapshot.state.units,
              turnPlayer: latestSnapshot.state.turnPlayer
            }
          : this.serializer.diffSnapshotsWithPatches(
              latestSnapshot.state,
              previousSnapshot.state
            )
    };
  }

  getLatestPatchDiffSnapshotForPlayer(
    playerId: string
  ): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const latestSnapshot = this.getLatestSnapshotForPlayer(playerId);
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (this.nextId < 2) {
      return {
        ...latestSnapshot,
        state: {
          entityPatches: {},
          addedEntities: latestSnapshot.state.entities,
          removedEntities: [],
          phase: latestSnapshot.state.phase,
          interaction: latestSnapshot.state.interaction,
          board: latestSnapshot.state.board,
          turnCount: latestSnapshot.state.turnCount,
          players: latestSnapshot.state.players,
          config: latestSnapshot.state.config,
          tiles: latestSnapshot.state.tiles,
          units: latestSnapshot.state.units,
          turnPlayer: latestSnapshot.state.turnPlayer
        }
      };
    }

    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              entityPatches: {},
              addedEntities: latestSnapshot.state.entities,
              removedEntities: [],
              phase: latestSnapshot.state.phase,
              interaction: latestSnapshot.state.interaction,
              board: latestSnapshot.state.board,
              turnCount: latestSnapshot.state.turnCount,
              players: latestSnapshot.state.players,
              config: latestSnapshot.state.config,
              tiles: latestSnapshot.state.tiles,
              units: latestSnapshot.state.units,
              turnPlayer: latestSnapshot.state.turnPlayer
            }
          : this.serializer.diffSnapshotsWithPatches(
              latestSnapshot.state,
              previousSnapshot.state
            )
    };
  }

  getPatchDiffSnapshotForPlayerAt(
    index: number,
    playerId: string
  ): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const snapshot = this.getSnapshotForPlayerAt(playerId, index);
    if (snapshot.kind === 'error') {
      return snapshot;
    }

    if (index < 1) {
      return {
        ...snapshot,
        state: {
          entityPatches: {},
          addedEntities: snapshot.state.entities,
          removedEntities: [],
          phase: snapshot.state.phase,
          interaction: snapshot.state.interaction,
          board: snapshot.state.board,
          turnCount: snapshot.state.turnCount,
          players: snapshot.state.players,
          config: snapshot.state.config,
          tiles: snapshot.state.tiles,
          units: snapshot.state.units,
          turnPlayer: snapshot.state.turnPlayer
        }
      };
    }

    const previousSnapshot = this.getOmniscientSnapshotAt(index - 1);

    return {
      ...snapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              entityPatches: {},
              addedEntities: snapshot.state.entities,
              removedEntities: [],
              phase: snapshot.state.phase,
              interaction: snapshot.state.interaction,
              board: snapshot.state.board,
              turnCount: snapshot.state.turnCount,
              players: snapshot.state.players,
              config: snapshot.state.config,
              tiles: snapshot.state.tiles,
              units: snapshot.state.units,
              turnPlayer: snapshot.state.turnPlayer
            }
          : this.serializer.diffSnapshotsWithPatches(
              snapshot.state,
              previousSnapshot.state
            )
    };
  }

  async takeSnapshot() {
    try {
      if (!this.isEnabled) return;

      const events = this.eventsSinceLastSnapshot
        // @ts-expect-error
        .toSorted((a, b) => (a.data.event.__id - b.data.event.__id) as unknown as number)
        .map((event: GameStarEvent) => event.serialize());
      const id = this.nextId++;
      const omnisicientState = this.serializer.serializeOmniscientState();

      this.omniscientCache.push({
        kind: 'state',
        id,
        events: events as any,
        state: omnisicientState
      });
      this.playerCaches[this.game.playerSystem.player1.id].push({
        kind: 'state',
        id,
        events: events as any,
        state: this.serializer.serializePlayerState(
          this.game.playerSystem.player1.id,
          this.eventsSinceLastSnapshot
        )
      });

      this.playerCaches[this.game.playerSystem.player2.id].push({
        kind: 'state',
        id,
        events: events as any,
        state: this.serializer.serializePlayerState(
          this.game.playerSystem.player2.id,
          this.eventsSinceLastSnapshot
        )
      });

      this.eventsSinceLastSnapshot = [];
      await this.game.emit(GAME_EVENTS.NEW_SNAPSHOT, new GameNewSnapshotEvent({ id }));
    } catch (err) {
      const idToRemove = this.nextId;
      Object.values(this.playerCaches).forEach(cache => {
        if (cache.at(-1)?.id === idToRemove) cache.pop();
      });
      if (this.omniscientCache.at(-1)?.id === idToRemove) this.omniscientCache.pop();

      this.eventsSinceLastSnapshot = [];
      this.nextId--;
      throw err;
    }
  }

  async takeErrorSnapshot() {
    if (!this.isEnabled) return;
    const id = this.nextId++;
    const events = this.eventsSinceLastSnapshot
      .filter(e => e.data.eventName === GAME_EVENTS.ERROR)
      .map(event => event.serialize()) as SerializedStarEvent[];

    const snapshot = {
      id,
      kind: 'error' as const,
      events,
      state: {
        config: this.game.config,
        entities: {},
        players: this.game.playerSystem.players.map(player => player.id),
        phase: {
          state: GAME_PHASES.GAME_END,
          ctx: {}
        },
        interaction: {
          ctx: {
            player: this.game.playerSystem.player1.id
          }
        }
      } as unknown as SerializedPlayerState
    };

    this.playerCaches[this.game.playerSystem.player1.id].push(snapshot);
    this.playerCaches[this.game.playerSystem.player2.id].push(snapshot);
    this.omniscientCache.push(snapshot);

    this.eventsSinceLastSnapshot = [];
    await this.game.emit(GAME_EVENTS.NEW_SNAPSHOT, new GameNewSnapshotEvent({ id }));
  }
}
