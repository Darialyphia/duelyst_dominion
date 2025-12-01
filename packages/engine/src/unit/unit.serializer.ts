import type { Unit } from './unit.entity';
import type { Game } from '../game/game';
import { ZoneCalculator } from './zone-calculator';
import type { Point } from '@game/shared';

export type SerializedUnit = {
  id: string;
  entityType: 'unit';
  card: string;
  isGeneral: boolean;
  position: Point;
  baseAtk: number;
  atk: number;
  baseMaxHp: number;
  speed: number;
  basespeed: number;
  maxHp: number;
  currentHp: number;
  isFullHp: boolean;
  player: string;
  keywords: Array<{ id: string; name: string; description: string }>;
  isExhausted: boolean;
  isDead: boolean;
  moveZone: string[];
  sprintZone: string[];
  dangerZone: string[];
  attackableCells: string[];
  modifiers: string[];
  intent: {
    target: string | null;
    path: Point[];
  } | null;
};

export class UnitSerializer {
  constructor(private game: Game) {}

  serialize(unit: Unit): SerializedUnit {
    const zoneCalculator = new ZoneCalculator(this.game, unit);
    const zones = zoneCalculator.calculateZones();
    const intent = unit.behavior.getIntent();

    return {
      id: unit.id,
      entityType: 'unit' as const,
      card: unit.card.id,
      position: unit.position.serialize(),
      baseAtk: unit.card.blueprint.atk,
      atk: unit.atk,
      basespeed: unit.card.blueprint.speed,
      speed: unit.speed,
      baseMaxHp: unit.card.blueprint.maxHp,
      maxHp: unit.maxHp,
      currentHp: unit.remainingHp,
      isFullHp: unit.remainingHp === unit.maxHp,
      isGeneral: unit.isGeneral,
      player: unit.player.id,
      keywords: [],
      isExhausted: unit.isExhausted,
      isDead: !unit.isAlive,
      moveZone: zones.moveZone,
      sprintZone: zones.sprintZone,
      dangerZone: zones.dangerZone,
      attackableCells: zones.attackableCells,
      modifiers: unit.modifiers.list.map(modifier => modifier.id),
      intent: intent
        ? {
            target: intent.target?.id ?? null,
            path: intent.path
          }
        : null
    };
  }
}
