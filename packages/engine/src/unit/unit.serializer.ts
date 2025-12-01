import type { Unit, SerializedUnit } from './unit.entity';
import type { Game } from '../game/game';
import { ZoneCalculator } from './zone-calculator';

export class UnitSerializer {
  constructor(private game: Game) {}

  serialize(unit: Unit): SerializedUnit {
    const zoneCalculator = new ZoneCalculator(this.game, unit);
    const zones = zoneCalculator.calculateZones();

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
      capturableShrines: []
    };
  }
}
