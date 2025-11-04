import type { Values } from '@game/shared';

export const TARGETING_TYPES = {
  EMPTY: 'empty',
  ALLY_UNIT: 'ally_unit',
  ALLY_GENERAL: 'ally_general',
  ALLY_MINION: 'ally_minion',
  ALLY_SHRINE: 'ally_shrine',
  ENEMY_UNIT: 'enemy_unit',
  ENEMY_GENERAL: 'enemy_general',
  ENEMY_MINION: 'enemy_minion',
  ENEMY_SHRINE: 'enemy_shrine',
  SHRINE: 'shrine',
  UNIT: 'unit',
  GENERAL: 'general',
  MINION: 'minion',
  ANYWHERE: 'anywhere'
} as const;

export type TargetingType = Values<typeof TARGETING_TYPES>;
