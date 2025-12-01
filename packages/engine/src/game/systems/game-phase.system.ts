import {
  assert,
  StateMachine,
  stateTransition,
  type BetterExtract,
  type Values
} from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASES, GAME_PHASE_EVENTS, type GamePhase } from '../game.enums';
import { MainPhase } from '../phases/main.phase';
import { GameEndPhase } from '../phases/game-end.phase';
import { MulliganPhase } from '../phases/mulligan.phase';
import { PlayCardPhase } from '../phases/play-card.phase';
import { IllegalCardPlayedError } from '../../input/input-errors';
import { CombatPhase } from '../phases/combat.phase';

export const GAME_PHASE_TRANSITIONS = {
  COMMIT_MULLIGAN: 'commit_mulligan',
  DRAW_FOR_TURN: 'draw_for_turn',
  END_TURN: 'end_turn',
  START_TURN: 'start_turn',
  PLAYER_WON: 'player_won',
  START_COMBAT: 'start_combat',
  END_COMBAT: 'end_combat',
  START_PLAYING_CARD: 'start_playing_card',
  COMMIT_PLAYING_CARD: 'commit_playing_card',
  CANCEL_PLAYING_CARD: 'cancel_playing_card'
} as const;
export type GamePhaseTransition = Values<typeof GAME_PHASE_TRANSITIONS>;

export type GamePhaseEventMap = {
  [GAME_PHASE_EVENTS.GAME_TURN_START]: GameTurnEvent;
  [GAME_PHASE_EVENTS.GAME_TURN_END]: GameTurnEvent;
  [GAME_PHASE_EVENTS.BEFORE_CHANGE_PHASE]: GamePhaseBeforeChangeEvent;
  [GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE]: GamePhaseAfterChangeEvent;
};

export type GamePhaseContext =
  | {
      state: BetterExtract<GamePhase, 'mulligan_phase'>;
      ctx: MulliganPhase;
    }
  | {
      state: BetterExtract<GamePhase, 'main_phase'>;
      ctx: MainPhase;
    }
  | {
      state: BetterExtract<GamePhase, 'combat_phase'>;
      ctx: CombatPhase;
    }
  | {
      state: BetterExtract<GamePhase, 'playing_card_phase'>;
      ctx: PlayCardPhase;
    }
  | {
      state: BetterExtract<GamePhase, 'game_end'>;
      ctx: GameEndPhase;
    };

export type SerializedGamePhaseContext =
  | {
      state: BetterExtract<GamePhase, 'mulligan_phase'>;
      ctx: ReturnType<MulliganPhase['serialize']>;
    }
  | {
      state: BetterExtract<GamePhase, 'main_phase'>;
      ctx: ReturnType<MainPhase['serialize']>;
    }
  | {
      state: BetterExtract<GamePhase, 'combat_phase'>;
      ctx: ReturnType<CombatPhase['serialize']>;
    }
  | {
      state: Extract<GamePhase, 'playing_card_phase'>;
      ctx: ReturnType<PlayCardPhase['serialize']>;
    }
  | {
      state: Extract<GamePhase, 'game_end'>;
      ctx: ReturnType<GameEndPhase['serialize']>;
    };

export class GamePhaseSystem extends StateMachine<GamePhase, GamePhaseTransition> {
  private _winner: Player | null = null;

  private _elapsedTurns = 0;

  private _turnPlayer!: Player;

  private firstPlayer!: Player;

  readonly ctxDictionary = {
    [GAME_PHASES.MULLIGAN]: MulliganPhase,
    [GAME_PHASES.MAIN]: MainPhase,
    [GAME_PHASES.COMBAT]: CombatPhase,
    [GAME_PHASES.PLAYING_CARD]: PlayCardPhase,
    [GAME_PHASES.GAME_END]: GameEndPhase
  };

  private _ctx: GamePhaseContext['ctx'];

  constructor(private game: Game) {
    super(GAME_PHASES.MULLIGAN);
    this._ctx = new MulliganPhase(this.game);
    this.addTransitions([
      stateTransition(
        GAME_PHASES.MULLIGAN,
        GAME_PHASE_TRANSITIONS.COMMIT_MULLIGAN,
        GAME_PHASES.MAIN
      ),
      stateTransition(
        GAME_PHASES.MAIN,
        GAME_PHASE_TRANSITIONS.END_TURN,
        GAME_PHASES.MAIN
      ),
      stateTransition(
        GAME_PHASES.MAIN,
        GAME_PHASE_TRANSITIONS.START_PLAYING_CARD,
        GAME_PHASES.PLAYING_CARD
      ),
      stateTransition(
        GAME_PHASES.PLAYING_CARD,
        GAME_PHASE_TRANSITIONS.COMMIT_PLAYING_CARD,
        GAME_PHASES.MAIN
      ),
      stateTransition(
        GAME_PHASES.PLAYING_CARD,
        GAME_PHASE_TRANSITIONS.CANCEL_PLAYING_CARD,
        GAME_PHASES.MAIN
      ),
      stateTransition(
        GAME_PHASES.MAIN,
        GAME_PHASE_TRANSITIONS.PLAYER_WON,
        GAME_PHASES.GAME_END
      ),
      stateTransition(
        GAME_PHASES.PLAYING_CARD,
        GAME_PHASE_TRANSITIONS.PLAYER_WON,
        GAME_PHASES.GAME_END
      )
    ]);
  }

  async initialize() {
    // const idx = this.game.rngSystem.nextInt(this.game.playerSystem.players.length);
    this._turnPlayer = this.game.playerSystem.player1;
    this.firstPlayer = this._turnPlayer;
  }

  async startGame() {
    await (this._ctx as MulliganPhase).onEnter();
  }

  shutdown() {}

  getContext<T extends GamePhase>() {
    assert(
      this._ctx instanceof this.ctxDictionary[this.getState()],
      new CorruptedGamephaseContextError()
    );
    return {
      state: this.getState() as T,
      ctx: this._ctx
    } as GamePhaseContext & { state: T };
  }

  get winner() {
    return this._winner;
  }

  get elapsedTurns() {
    return this._elapsedTurns;
  }

  get turnPlayer() {
    return this._turnPlayer;
  }

  private startGameTurn() {
    return this.game.emit(
      GAME_PHASE_EVENTS.GAME_TURN_START,
      new GameTurnEvent({ turnCount: this.elapsedTurns })
    );
  }

  private endGameTurn() {
    this._elapsedTurns++;
    return this.game.emit(
      GAME_PHASE_EVENTS.GAME_TURN_END,
      new GameTurnEvent({ turnCount: this.elapsedTurns })
    );
  }

  async sendTransition(transition: GamePhaseTransition) {
    const previousPhase = this.getState();
    const nextPhase = this.getNextState(transition);

    await this.game.emit(
      GAME_PHASE_EVENTS.BEFORE_CHANGE_PHASE,
      new GamePhaseBeforeChangeEvent({
        from: previousPhase,
        to: nextPhase!
      })
    );

    this.dispatch(transition);

    await this._ctx.onExit();

    this._ctx = new this.ctxDictionary[nextPhase!](this.game);
    await this.game.emit(
      GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE,
      new GamePhaseAfterChangeEvent({
        from: previousPhase,
        to: this.getContext()
      })
    );
    await this._ctx.onEnter();
  }

  async endTurn() {
    await this.turnPlayer.endTurn();

    const nextPlayer = this._turnPlayer.opponent;
    if (nextPlayer.equals(this.firstPlayer)) {
      await this.endGameTurn();
      this._turnPlayer = nextPlayer;
      await this.startGameTurn();
    } else {
      this._turnPlayer = nextPlayer;
    }

    await this._turnPlayer.startTurn();
  }

  async commitMulligan() {
    assert(this.can(GAME_PHASE_TRANSITIONS.COMMIT_MULLIGAN), new WrongGamePhaseError());
    await this.sendTransition(GAME_PHASE_TRANSITIONS.COMMIT_MULLIGAN);
  }

  async declareWinner(player: Player) {
    assert(this.can(GAME_PHASE_TRANSITIONS.PLAYER_WON), new WrongGamePhaseError());
    this._winner = player;
    await this.sendTransition(GAME_PHASE_TRANSITIONS.PLAYER_WON);
  }

  async playCard(index: number, player: Player) {
    assert(this.getState() === GAME_PHASES.MAIN, new WrongGamePhaseError());

    const canPlay = this.game.gamePhaseSystem.turnPlayer.equals(player);
    assert(canPlay, new IllegalCardPlayedError());

    const card = player.cardManager.getCardInHandAt(index);
    assert(card, new IllegalCardPlayedError());
    assert(card.canPlay(), new IllegalCardPlayedError());
    await this.sendTransition(GAME_PHASE_TRANSITIONS.START_PLAYING_CARD);
    await (this._ctx as PlayCardPhase).play(card);
  }

  serialize() {
    const context = this.getContext();
    return {
      state: context.state,
      ctx: context.ctx.serialize()
    } as SerializedGamePhaseContext;
  }
}

export class GameTurnEvent extends TypedSerializableEvent<
  { turnCount: number },
  { turnCount: number }
> {
  serialize(): { turnCount: number } {
    return {
      turnCount: this.data.turnCount
    };
  }
}

export class GamePhaseBeforeChangeEvent extends TypedSerializableEvent<
  { from: GamePhase; to: GamePhase },
  { from: GamePhase; to: GamePhase }
> {
  serialize() {
    return {
      from: this.data.from,
      to: this.data.to
    };
  }
}

export class GamePhaseAfterChangeEvent extends TypedSerializableEvent<
  { from: GamePhase; to: GamePhaseContext },
  { from: GamePhase; to: SerializedGamePhaseContext }
> {
  serialize() {
    return {
      from: this.data.from,
      to: {
        state: this.data.to.state,
        ctx: this.data.to.ctx.serialize() as any // Type assertion to match SerializedGamePhaseContext
      }
    };
  }
}

export class WrongGamePhaseError extends Error {
  constructor() {
    super('Wrong game phase');
  }
}

export class CorruptedGamephaseContextError extends Error {
  constructor() {
    super('Corrupted game phase context');
  }
}
