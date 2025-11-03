import type { Values } from '@game/shared';

export const PLAYER_EVENTS = {
  PLAYER_START_TURN: 'player:start_turn',
  PLAYER_END_TURN: 'player:end_turn',
  PLAYER_BEFORE_DRAW: 'player:before_draw',
  PLAYER_AFTER_DRAW: 'player:after_draw',
  PLAYER_BEFORE_REPLACE_CARD: 'player:before_replace_card',
  PLAYER_AFTER_REPLACE_CARD: 'player:after_replace_card',
  PLAYER_BEFORE_PLAY_CARD: 'player:before_play_card',
  PLAYER_AFTER_PLAY_CARD: 'player:after_play_card',
  PLAYER_BEFORE_MANA_CHANGE: 'player:before_mana_change',
  PLAYER_AFTER_MANA_CHANGE: 'player:after_mana_change',
  PLAYER_BEFORE_EARN_VICTORY_POINTS: 'player:before_earn_victory_points',
  PLAYER_AFTER_EARN_VICTORY_POINTS: 'player:after_earn_victory_points'
} as const;
export type PlayerEvent = Values<typeof PLAYER_EVENTS>;

export const ARTIFACT_EVENTS = {
  ARTIFACT_EQUIPED: 'artifact:equiped',

  ARTIFACT_BEFORE_DURABILITY_CHANGE: 'artifact:before_durability_change',
  ARTIFACT_AFTER_DURABILITY_CHANGE: 'artifact:after_durability_change',

  ARTIFACT_BEFORE_DESTROY: 'artifact:before_destroy',
  ARTIFACT_AFTER_DESTROY: 'artifact:after_destroy'
} as const;
export type ArtifactEvent = Values<typeof ARTIFACT_EVENTS>;
