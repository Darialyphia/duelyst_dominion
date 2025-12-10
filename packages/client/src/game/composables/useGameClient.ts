import { useSafeInject } from '@/shared/composables/useSafeInject';
import {
  GameClient,
  type GameClientOptions
} from '@game/engine/src/client/client';
import type {
  FXEvent,
  FXEventMap
} from '@game/engine/src/client/controllers/fx-controller';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  isDefined,
  type MaybePromise,
  type Nullable,
  type Point
} from '@game/shared';
import type { InjectionKey, Ref } from 'vue';
import { gameStateRef } from './gameStateRef';
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import type { TileViewModel } from '@game/engine/src/client/view-models/tile.model';
import type { VFXStep } from '@game/engine/src/game/systems/vfx.system';

type GameClientContext = { client: Ref<GameClient>; playerId: Ref<string> };

const GAME_CLIENT_INJECTION_KEY = Symbol(
  'game-client'
) as InjectionKey<GameClientContext>;

export const provideGameClient = (options: GameClientOptions) => {
  const client = ref(new GameClient(options)) as Ref<GameClient>;
  client.value.onUpdate(async () => {
    triggerRef(client);
    // console.log('[Client] state updated', client.value);
  });

  const playerId = ref(client.value.playerId);
  watch(playerId, newPlayerId => {
    client.value.playerId = newPlayerId;
  });

  provide(GAME_CLIENT_INJECTION_KEY, { client, playerId });

  return { client, playerId };
};

export const useGameClient = () => {
  return useSafeInject(GAME_CLIENT_INJECTION_KEY);
};

export const useGameState = () => {
  const { client } = useGameClient();

  return computed(() => client.value.stateManager.state);
};

export const useGameUi = () => {
  const { client } = useGameClient();

  return gameStateRef(() => client.value.ui);
};

export const useEntity = <T>(entityId: MaybeRef<string>) => {
  return gameStateRef(state => {
    return state.entities[unref(entityId)] as T;
  });
};

export const useMaybeEntity = <T>(entityId: MaybeRef<Nullable<string>>) => {
  return gameStateRef(state => {
    const id = unref(entityId);
    if (!isDefined(id)) return null;

    return state.entities[id] as T;
  });
};

export const useEntities = <T>(entityIds: MaybeRef<string[]>) => {
  const state = useGameState();
  return computed(() => {
    const ids = unref(entityIds);
    return ids.map(id => {
      const entity = state.value.entities[id];
      if (!entity) {
        throw new Error(`Entity with ID ${id} not found in the game state.`);
      }
      return entity as unknown as T;
    });
  });
};

export const usePlayer = (playerId: MaybeRef<string>) => {
  return useEntity<PlayerViewModel>(playerId);
};

export const useCard = (cardId: MaybeRef<string>) => {
  return useEntity<CardViewModel>(cardId);
};

export const useUnits = () => {
  const state = useGameState();
  return useEntities<UnitViewModel>(computed(() => state.value.units));
};

export const useTiles = () => {
  const state = useGameState();
  return useEntities<TileViewModel>(computed(() => state.value.tiles));
};

export const useFxEvent = <T extends FXEvent>(
  name: T,
  handler: (eventArg: FXEventMap[T]) => MaybePromise<void>
) => {
  const { client } = useGameClient();

  const unsub = client.value.fx.on(name, handler);

  onUnmounted(unsub);

  return unsub;
};

export const useVFXStep = <T extends VFXStep['type']>(
  name: T,
  handler: (step: VFXStep & { type: T }) => MaybePromise<void>
) => {
  const { client } = useGameClient();

  const unsub = client.value.vfx.on(name, handler as any);

  onUnmounted(unsub);

  return unsub;
};

export const useBoardCells = () => {
  const state = useGameState();
  return computed(() => {
    return state.value.board.cells.map(cellId => {
      return state.value.entities[cellId] as BoardCellViewModel;
    });
  });
};

export const useBoardCellByPosition = (position: MaybeRef<Point>) => {
  const state = useGameState();
  return computed(() => {
    const pos = unref(position);

    return state.value.board.cells
      .map(cellId => state.value.entities[cellId] as BoardCellViewModel)
      .find(cell => cell.x === pos.x && cell.y === pos.y)!;
  });
};

export const useMyPlayer = () => {
  const { playerId } = useGameClient();

  return usePlayer(playerId);
};

export const useOpponentPlayer = () => {
  const state = useGameState();
  const { playerId } = useGameClient();
  return computed(() => {
    const myId = unref(playerId);
    const opponentId = state.value.players.find(id => id !== myId);
    if (!opponentId) {
      throw new Error('Opponent player not found');
    }
    return state.value.entities[opponentId] as PlayerViewModel;
  });
};

export const usePlayers = () => {
  const state = useGameState();
  return computed(() => {
    return state.value.players.map(
      id => state.value.entities[id] as PlayerViewModel
    );
  });
};

export const usePlayer1 = () => {
  const players = usePlayers();

  return computed(() => players.value.find(p => p.isPlayer1)!);
};

export const usePlayer2 = () => {
  const players = usePlayers();

  return computed(() => players.value.find(p => !p.isPlayer1)!);
};
