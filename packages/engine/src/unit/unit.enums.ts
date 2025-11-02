import type { Values } from '@game/shared';

export const UNIT_EVENTS = {
  UNIT_BEFORE_MOVE: 'unit.before_move',
  UNIT_AFTER_MOVE: 'unit.after_move',
  UNIT_BEFORE_ATTACK: 'unit.before_attack',
  UNIT_AFTER_ATTACK: 'unit.after_attack',
  UNIT_BEFORE_COUNTERATTACK: 'unit.before_counterattack',
  UNIT_AFTER_COUNTERATTACK: 'unit.after_counterattack',
  UNIT_BEFORE_DEAL_DAMAGE: 'unit.before_deal_damage',
  UNIT_AFTER_DEAL_DAMAGE: 'unit.after_deal_damage',
  UNIT_BEFORE_RECEIVE_DAMAGE: 'unit.before_receive_damage',
  UNIT_AFTER_RECEIVE_DAMAGE: 'unit.after_receive_damage',
  UNIT_BEFORE_DESTROY: 'unit.before_destroy',
  UNIT_AFTER_DESTROY: 'unit.after_destroy',
  UNIT_BEFORE_TELEPORT: 'unit.before_teleport',
  UNIT_AFTER_TELEPORT: 'unit.after_teleport'
} as const;
export type UnitEvent = Values<typeof UNIT_EVENTS>;
