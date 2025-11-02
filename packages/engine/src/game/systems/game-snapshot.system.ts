import type { AnyObject, EmptyObject } from '@game/shared';
import { System } from '../../system';
import type { Config } from '../../config';
import {
  GAME_EVENTS,
  GameNewSnapshotEvent,
  type GameEventName,
  type GameStarEvent,
  type SerializedStarEvent
} from '../game.events';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedGamePhaseContext } from './game-phase.system';
import type { SerializedInteractionContext } from './game-interaction.system';
import type { CardBeforePlayEvent, CardDiscardEvent } from '../../card/card.events';
import type { SerializedMinionCard } from '../../card/entities/minion-card.entity';
import type { SerializedBoard } from '../../board/board-system';
import type { SerializedArtifactCard } from '../../card/entities/artifact-card.entity';
import type { SerializedGeneralCard } from '../../card/entities/general-card.entity';
import type { SerializedSpellCard } from '../../card/entities/spell-card.entity';
import type { SerializedUnit } from '../../unit/unit.entity';
import type { SerializedCell } from '../../board/board-cell.entity';
import type { SerializedTile } from '../../tile/tile.entity';

export type GameStateSnapshot<T> = {
  id: number;
  state: T;
  events: SerializedStarEvent[];
};

export type EntityDictionary = Record<
  string,
  | SerializedMinionCard
  | SerializedGeneralCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedPlayer
  | SerializedModifier
  | SerializedCell
  | SerializedUnit
  | SerializedTile
>;

export type EntityDiffDictionary = Record<
  string,
  | Partial<SerializedMinionCard>
  | Partial<SerializedGeneralCard>
  | Partial<SerializedSpellCard>
  | Partial<SerializedArtifactCard>
  | Partial<SerializedPlayer>
  | Partial<SerializedModifier>
  | Partial<SerializedCell>
  | Partial<SerializedUnit>
  | Partial<SerializedTile>
>;

export type SerializedOmniscientState = {
  config: Config;
  entities: EntityDictionary;
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  board: SerializedBoard;
  turnCount: number;
  turnPlayer: string;
  players: string[];
  tiles: string[];
  units: string[];
};

export type SnapshotDiff = {
  config: Partial<Config>;
  entities: EntityDiffDictionary;
  addedEntities: string[];
  removedEntities: string[];
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  board: Partial<SerializedBoard>;
  turnCount: number;
  turnPlayer: string;
  players: string[];
  tiles: string[];
  units: string[];
};

export type SerializedPlayerState = SerializedOmniscientState;

export class GameSnaphotSystem extends System<EmptyObject> {
  private playerCaches: Record<string, GameStateSnapshot<SerializedPlayerState>[]> = {
    omniscient: []
  };
  private omniscientCache: GameStateSnapshot<SerializedOmniscientState>[] = [];

  private eventsSinceLastSnapshot: GameStarEvent[] = [];

  private nextId = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize(): void {
    const ignoredEvents: GameEventName[] = [
      GAME_EVENTS.NEW_SNAPSHOT,
      GAME_EVENTS.FLUSHED,
      GAME_EVENTS.INPUT_START,
      GAME_EVENTS.INPUT_END
    ];
    this.game.on('*', event => {
      if (ignoredEvents.includes(event.data.eventName)) return;
      this.eventsSinceLastSnapshot.push(event);
    });
    this.playerCaches[this.game.playerSystem.player1.id] = [];
    this.playerCaches[this.game.playerSystem.player2.id] = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
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

  getLatestOmniscientSnapshot(): GameStateSnapshot<SerializedOmniscientState> {
    return this.getOmniscientSnapshotAt(this.nextId - 1);
  }

  getLatestOmniscientDiffSnapshot(): GameStateSnapshot<SnapshotDiff> {
    const latestSnapshot = this.getLatestOmniscientSnapshot();
    if (this.nextId < 2) {
      return {
        ...latestSnapshot,
        state: {
          removedEntities: [],
          addedEntities: Object.keys(latestSnapshot.state.entities),
          ...latestSnapshot.state
        }
      };
    }
    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state: this.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  private getObjectDiff<T extends AnyObject>(obj: T, prevObj: T | undefined): Partial<T> {
    if (!prevObj) return { ...obj };
    const result: Partial<T> = {};
    for (const key in obj) {
      if (obj[key] !== prevObj[key]) {
        result[key] = obj[key];
      }
    }
    for (const key in prevObj) {
      if (!(key in obj)) {
        result[key] = undefined;
      }
    }
    return result;
  }

  private diffSnapshots(
    state: SerializedOmniscientState,
    prevState: SerializedOmniscientState
  ): SnapshotDiff {
    const entities: EntityDiffDictionary = {};
    for (const [key, entity] of Object.entries(state.entities)) {
      entities[key] = this.getObjectDiff(entity, prevState.entities[key]);
    }
    return {
      config: this.getObjectDiff(state.config, prevState.config),
      entities,
      removedEntities: Object.keys(prevState.entities).filter(
        key => !(key in state.entities)
      ),
      addedEntities: Object.keys(state.entities).filter(
        key => !(key in prevState.entities)
      ),
      phase: state.phase,
      interaction: state.interaction,
      board: this.getObjectDiff(state.board, prevState.board),
      turnCount: state.turnCount - prevState.turnCount,
      turnPlayer: state.turnPlayer,
      players: state.players,
      tiles: state.tiles,
      units: state.units
    };
  }

  getLatestSnapshotForPlayer(playerId: string): GameStateSnapshot<SerializedPlayerState> {
    return this.getSnapshotForPlayerAt(playerId, this.nextId - 1);
  }

  private buildEntityDictionary(): EntityDictionary {
    const entities: EntityDictionary = {};
    this.game.cardSystem.cards.forEach(card => {
      entities[card.id] = card.serialize();
      card.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });
    this.game.playerSystem.players.forEach(player => {
      entities[player.id] = player.serialize();
      player.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });
    this.game.unitSystem.units.forEach(unit => {
      entities[unit.id] = unit.serialize() as SerializedUnit;
      unit.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });
    this.game.boardSystem.cells.forEach(cell => {
      entities[cell.id] = cell.serialize() as SerializedCell;
    });
    this.game.tileSystem.tiles.forEach(tile => {
      entities[tile.id] = tile.serialize() as SerializedTile;
    });
    return entities;
  }

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      config: this.game.config,
      entities: this.buildEntityDictionary(),
      phase: this.game.gamePhaseSystem.serialize(),
      interaction: this.game.interaction.serialize(),
      board: this.game.boardSystem.serialize(),
      players: this.game.playerSystem.players.map(player => player.id),
      units: this.game.unitSystem.units.map(unit => unit.id),
      tiles: this.game.tileSystem.tiles.map(tile => tile.id),
      turnPlayer: this.game.gamePhaseSystem.turnPlayer.id,
      turnCount: this.game.gamePhaseSystem.elapsedTurns
    };
  }

  serializePlayerState(playerId: string): SerializedPlayerState {
    const state = this.serializeOmniscientState();

    // Remove entities that the player shouldn't have access to in order to prevent cheating

    const opponent = this.game.playerSystem.getPlayerById(playerId)!.opponent;

    const hasBeenPlayed = (cardId: string) => {
      return this.eventsSinceLastSnapshot.some(e => {
        const event = e.data.event;
        if (
          e.data.eventName === GAME_EVENTS.CARD_BEFORE_PLAY &&
          (event as CardBeforePlayEvent).data.card.id === cardId
        ) {
          return true;
        }
        if (
          e.data.eventName === GAME_EVENTS.CARD_DISCARD &&
          (event as CardDiscardEvent).data.card.id === cardId
        ) {
          return true;
        }

        return false;
      });
    };

    opponent.cardManager.deck.cards.forEach(card => {
      if (hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    opponent.cardManager.hand.forEach(card => {
      if (hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    const opponentData = { ...(state.entities[opponent.id] as SerializedPlayer) };

    opponentData.remainingCardsInDeck = [];
    opponentData.currentlyPlayedCard = null;
    state.entities[opponent.id] = opponentData;

    return state;
  }

  takeSnapshot() {
    const events = this.eventsSinceLastSnapshot.map(event => event.serialize());
    const id = this.nextId++;
    this.playerCaches[this.game.playerSystem.player1.id].push({
      id,
      events: events as any,
      state: this.serializePlayerState(this.game.playerSystem.player1.id)
    });

    this.playerCaches[this.game.playerSystem.player2.id].push({
      id,
      events: events as any,
      state: this.serializePlayerState(this.game.playerSystem.player2.id)
    });

    this.omniscientCache.push({
      id,
      events: events as any,
      state: this.serializeOmniscientState()
    });

    this.eventsSinceLastSnapshot = [];
    void this.game.emit(GAME_EVENTS.NEW_SNAPSHOT, new GameNewSnapshotEvent({}));
  }
}
