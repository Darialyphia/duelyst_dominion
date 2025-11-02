import {
  type BetterExtract,
  type Serializable,
  type Values,
  assert,
  StateMachine,
  stateTransition
} from '@game/shared';
import type { Game } from '../game';
import type { AnyCard } from '../../card/entities/card.entity';
import { GameError } from '../game-error';
import type { Player } from '../../player/player.entity';
import { SelectingSpaceOnBoardContext } from '../interactions/selecting-space-on-board.interaction';
import { ChoosingCardsContext } from '../interactions/choosing-cards.interaction';
import { IdleContext } from '../interactions/idle.interaction';
import { PlayCardContext } from '../interactions/play-card.interaction';
import { IllegalCardPlayedError } from '../../input/input-errors';
import type { BoardCell } from '../../board/board-cell.entity';
import type { AOEShape } from '../../aoe/aoe-shapes';

export const INTERACTION_STATES = {
  IDLE: 'idle',
  SELECTING_SPACE_ON_BOARD: 'selecting_space_on_board',
  CHOOSING_CARDS: 'choosing_cards',
  PLAYING_CARD: 'playing_card'
} as const;
export type InteractionStateDict = typeof INTERACTION_STATES;
export type InteractionState = Values<typeof INTERACTION_STATES>;

export const INTERACTION_STATE_TRANSITIONS = {
  START_SELECTING_SPACE_ON_BOARD: 'start_selecting_space_on_board',
  COMMIT_SELECTING_SPACE_ON_BOARD: 'commit_selecting_space_on_board',
  CANCEL_SELECTING_SPACE_ON_BOARD: 'cancel_selecting_space_on_board',
  START_CHOOSING_CARDS: 'start_choosing_cards',
  COMMIT_CHOOSING_CARDS: 'commit_choosing_cards',
  CANCEL_CHOOSING_CARDS: 'cancel_choosing_cards',
  START_PLAYING_CARD: 'start_playing_card',
  COMMIT_PLAYING_CARD: 'commit_playing_card',
  CANCEL_PLAYING_CARD: 'cancel_playing_card'
};
export type InteractionStateTransition = Values<typeof INTERACTION_STATE_TRANSITIONS>;

export type InteractionContext =
  | {
      state: BetterExtract<InteractionState, 'idle'>;
      ctx: IdleContext;
    }
  | {
      state: BetterExtract<InteractionState, 'selecting_space_on_board'>;
      ctx: SelectingSpaceOnBoardContext;
    }
  | {
      state: BetterExtract<InteractionState, 'choosing_cards'>;
      ctx: ChoosingCardsContext;
    }
  | {
      state: BetterExtract<InteractionState, 'playing_card'>;
      ctx: PlayCardContext;
    };

export type SerializedInteractionContext =
  | {
      state: Extract<InteractionState, 'idle'>;
      ctx: ReturnType<IdleContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'selecting_space_on_board'>;
      ctx: ReturnType<SelectingSpaceOnBoardContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'choosing_cards'>;
      ctx: ReturnType<ChoosingCardsContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'playing_card'>;
      ctx: ReturnType<PlayCardContext['serialize']>;
    };

export class GameInteractionSystem
  extends StateMachine<InteractionState, InteractionStateTransition>
  implements Serializable<SerializedInteractionContext>
{
  private ctxDictionary = {
    [INTERACTION_STATES.IDLE]: IdleContext,
    [INTERACTION_STATES.SELECTING_SPACE_ON_BOARD]: SelectingSpaceOnBoardContext,
    [INTERACTION_STATES.CHOOSING_CARDS]: ChoosingCardsContext,
    [INTERACTION_STATES.PLAYING_CARD]: PlayCardContext
  } as const;

  private _ctx: IdleContext | SelectingSpaceOnBoardContext | ChoosingCardsContext;

  constructor(private game: Game) {
    super(INTERACTION_STATES.IDLE);
    this.addTransitions([
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATES.SELECTING_SPACE_ON_BOARD
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CARDS,
        INTERACTION_STATES.CHOOSING_CARDS
      ),
      stateTransition(
        INTERACTION_STATES.CHOOSING_CARDS,
        INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CARDS,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.CHOOSING_CARDS,
        INTERACTION_STATE_TRANSITIONS.CANCEL_CHOOSING_CARDS,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_PLAYING_CARD,
        INTERACTION_STATES.PLAYING_CARD
      ),
      stateTransition(
        INTERACTION_STATES.PLAYING_CARD,
        INTERACTION_STATE_TRANSITIONS.COMMIT_PLAYING_CARD,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.PLAYING_CARD,
        INTERACTION_STATE_TRANSITIONS.CANCEL_PLAYING_CARD,
        INTERACTION_STATES.IDLE
      )
    ]);
    this._ctx = new IdleContext(this.game);
  }

  initialize() {}

  shutdown() {}

  serialize() {
    const context = this.getContext();
    return {
      state: context.state,
      ctx: context.ctx.serialize()
    } as SerializedInteractionContext;
  }

  getContext<T extends InteractionState>() {
    assert(
      this._ctx instanceof this.ctxDictionary[this.getState()],
      new CorruptedInteractionContextError()
    );
    return {
      state: this.getState() as T,
      ctx: this._ctx
    } as InteractionContext & { state: T };
  }

  async selectSpacesOnBoard(options: {
    isElligible: (candidate: BoardCell, selectedSpaces: BoardCell[]) => boolean;
    canCommit: (selectedCards: BoardCell[]) => boolean;
    isDone(selectedCards: BoardCell[]): boolean;
    getAoe: (selectedSpaces: BoardCell[]) => AOEShape | null;
    player: Player;
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_SELECTING_SPACE_ON_BOARD);
    this._ctx = await this.ctxDictionary[
      INTERACTION_STATES.SELECTING_SPACE_ON_BOARD
    ].create(this.game, options);

    return this.game.inputSystem.pause<BoardCell[]>();
  }

  async chooseCards<T extends AnyCard>(options: {
    player: Player;
    minChoiceCount: number;
    maxChoiceCount: number;
    choices: AnyCard[];
    label: string;
    source: AnyCard;
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CARDS);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.CHOOSING_CARDS].create(
      this.game,
      options
    );

    return this.game.inputSystem.pause<T[]>();
  }

  async declarePlayCardIntent(index: number, player: Player) {
    assert(
      this.getState() === INTERACTION_STATES.IDLE,
      new CorruptedInteractionContextError()
    );

    const canPlay = this.game.gamePhaseSystem.turnPlayer.equals(player);
    assert(canPlay, new IllegalCardPlayedError());

    const card = player.cardManager.getCardInHandAt(index);
    assert(card, new IllegalCardPlayedError());
    assert(card.canPlay(), new IllegalCardPlayedError());

    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_PLAYING_CARD);
    // @ts-expect-error
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.PLAYING_CARD].create(
      this.game,
      {
        card,
        player
      }
    );
  }

  onInteractionEnd() {
    this._ctx = new IdleContext(this.game);
  }
}

export class CorruptedInteractionContextError extends GameError {
  constructor() {
    super('Corrupted interaction context');
  }
}

export class InvalidPlayerError extends GameError {
  constructor() {
    super('Invalid player trying to interact');
  }
}

export class UnableToCommitError extends GameError {
  constructor() {
    super('Unable to commit');
  }
}

export class NotEnoughCardsError extends GameError {
  constructor(expected: number, received: number) {
    super(`Not enough cards selected, expected ${expected}, received ${received}`);
  }
}

export class TooManyCardsError extends GameError {
  constructor(expected: number, received: number) {
    super(`Too many cards selected, expected ${expected}, received ${received}`);
  }
}
