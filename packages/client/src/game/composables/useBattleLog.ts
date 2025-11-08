import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import type { GamePhase } from '@game/engine/src/game/game.enums';
import { useGameClient } from './useGameClient';

type BattleLogEventToken =
  | {
      kind: 'text';
      text: string;
    }
  | { kind: 'card'; card: CardViewModel }
  | {
      kind: 'player';
      player: PlayerViewModel;
    }
  | {
      kind: 'input';
      player: PlayerViewModel;
    }
  | { kind: 'game-turn-start'; turn: number }
  | { kind: 'game-phase-change'; phase: GamePhase }
  | { kind: 'player-turn_start'; player: PlayerViewModel };

export type BattleLogEvents = BattleLogEventToken[][];

export const useBattleLog = () => {
  const { client } = useGameClient();

  onMounted(() => {
    client.value.onUpdateCompleted(snapshot => {
      snapshot.events.forEach(() => {
        const tokens: BattleLogEventToken[] = [];

        if (tokens.length > 0) {
          events.value.push(tokens);
        }
      });
    });
  });

  const events = ref<BattleLogEvents>([
    [{ kind: 'text', text: 'Game started' }]
  ]);

  return events as Ref<BattleLogEvents>;
};
