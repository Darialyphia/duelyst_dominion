import type { Values } from '@game/shared';

export const GAME_PHASES = {
  MULLIGAN: 'mulligan_phase',
  MAIN: 'main_phase',
  GAME_END: 'game_end'
} as const;
export type GamePhasesDict = typeof GAME_PHASES;
export type GamePhase = Values<typeof GAME_PHASES>;

export const GAME_PHASE_EVENTS = {
  GAME_TURN_START: 'game_phase_turn_start',
  GAME_TURN_END: 'game_phase_turn_end',
  BEFORE_CHANGE_PHASE: 'game_phase_before_change_phase',
  AFTER_CHANGE_PHASE: 'game_phase_after_change_phase'
} as const;
export type GamePhaseEventName = Values<typeof GAME_PHASE_EVENTS>;

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
