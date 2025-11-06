import {
  type BetterExtract,
  type Serializable,
  assert,
  StateMachine,
  stateTransition
} from '@game/shared';
import type { Game } from '../game';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Player } from '../../player/player.entity';
import { SelectingSpaceOnBoardContext } from '../interactions/selecting-space-on-board.interaction';
import { ChoosingCardsContext } from '../interactions/choosing-cards.interaction';
import { IdleContext } from '../interactions/idle.interaction';
import { PlayCardContext } from '../interactions/play-card.interaction';
import { IllegalCardPlayedError } from '../../input/input-errors';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import type { GenericAOEShape } from '../../aoe/aoe-shape';
import {
  INTERACTION_STATE_TRANSITIONS,
  type InteractionState,
  type InteractionStateTransition,
  INTERACTION_STATES
} from '../game.enums';
import { CorruptedInteractionContextError } from '../game-error';

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
    getAoe: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
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
