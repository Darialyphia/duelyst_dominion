export type PlayerFilterBase =
  | { type: 'ally_player' }
  | { type: 'enemy_player' }
  | { type: 'any_player' }
  | { type: 'is_manual_target_owner'; params: { index: number } };

export type EventSpecificPlayerFilter =
  | { type: 'attack_target_owner' }
  | { type: 'attack_source_owner' }
  | { type: 'healing_target_owner' }
  | { type: 'healing_source_owner' }
  | { type: 'moved_unit_owner' }
  | { type: 'played_unit_owner' }
  | { type: 'destroyed_unit_owner' };

export type PlayerFilter = PlayerFilterBase | EventSpecificPlayerFilter;
