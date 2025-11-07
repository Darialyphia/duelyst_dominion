import type { Point, Vec2 } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Unit } from './unit.entity';
import type { UNIT_EVENTS } from './unit.enums';
import type { Damage } from '../utils/damage';
import type { AnyCard } from '../card/entities/card.entity';
import type { Position } from '../utils/position';

export class UnitBeforeMoveEvent extends TypedSerializableEvent<
  { unit: Unit; position: Vec2; path: Vec2[] },
  { unit: string; position: Point; path: Point[] }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      position: this.data.position.serialize(),
      path: this.data.path.map(vec => vec.serialize())
    };
  }
}

export class UnitAfterMoveEvent extends TypedSerializableEvent<
  { unit: Unit; position: Vec2; previousPosition: Vec2; path: Vec2[] },
  { unit: string; position: Point; previousPosition: Point; path: Point[] }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      position: this.data.position.serialize(),
      previousPosition: this.data.previousPosition.serialize(),
      path: this.data.path.map(vec => vec.serialize())
    };
  }
}

export class UnitAttackEvent extends TypedSerializableEvent<
  { target: Vec2 },
  { target: Point }
> {
  serialize() {
    return {
      target: this.data.target.serialize()
    };
  }

  get target() {
    return this.data.target;
  }
}

export class UnitDealDamageEvent extends TypedSerializableEvent<
  { targets: Unit[]; damage: Damage },
  { targets: Array<{ unit: string; damage: number }> }
> {
  serialize() {
    return {
      targets: this.data.targets.map(target => ({
        unit: target.id,
        damage: this.data.damage.getFinalAmount(target)
      }))
    };
  }
}

export class UnitReceiveDamageEvent extends TypedSerializableEvent<
  { from: AnyCard; target: Unit; damage: Damage },
  { from: string; damage: number }
> {
  serialize() {
    return {
      from: this.data.from.id,
      damage: this.data.damage.getFinalAmount(this.data.target)
    };
  }
}

export class UnitBeforeDestroyEvent extends TypedSerializableEvent<
  { source: AnyCard; unit: Unit },
  { source: string; unit: string }
> {
  serialize() {
    return {
      source: this.data.source.id,
      unit: this.data.unit.id
    };
  }
}

export class UnitAfterDestroyEvent extends TypedSerializableEvent<
  { unit: Unit; source: AnyCard; destroyedAt: Position },
  { unit: string; source: string; destroyedAt: Point }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      source: this.data.source.id,
      destroyedAt: this.data.destroyedAt.serialize()
    };
  }
}

export class UnitBeforeHealEvent extends TypedSerializableEvent<
  { unit: Unit; amount: number; source: AnyCard },
  { unit: string; amount: number; source: string }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      amount: this.data.amount,
      source: this.data.source.id
    };
  }
}

export class UnitAfterHealEvent extends TypedSerializableEvent<
  { unit: Unit; amount: number; source: AnyCard },
  { unit: string; amount: number; source: string }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      amount: this.data.amount,
      source: this.data.source.id
    };
  }
}

export type UnitEventMap = {
  [UNIT_EVENTS.UNIT_BEFORE_MOVE]: UnitBeforeMoveEvent;
  [UNIT_EVENTS.UNIT_AFTER_MOVE]: UnitAfterMoveEvent;
  [UNIT_EVENTS.UNIT_BEFORE_ATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.UNIT_AFTER_ATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.UNIT_BEFORE_COUNTERATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.UNIT_AFTER_COUNTERATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.UNIT_BEFORE_DEAL_DAMAGE]: UnitDealDamageEvent;
  [UNIT_EVENTS.UNIT_AFTER_DEAL_DAMAGE]: UnitDealDamageEvent;
  [UNIT_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE]: UnitReceiveDamageEvent;
  [UNIT_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE]: UnitReceiveDamageEvent;
  [UNIT_EVENTS.UNIT_BEFORE_DESTROY]: UnitBeforeDestroyEvent;
  [UNIT_EVENTS.UNIT_AFTER_DESTROY]: UnitAfterDestroyEvent;
  [UNIT_EVENTS.UNIT_BEFORE_TELEPORT]: UnitBeforeMoveEvent;
  [UNIT_EVENTS.UNIT_AFTER_TELEPORT]: UnitAfterMoveEvent;
  [UNIT_EVENTS.UNIT_BEFORE_HEAL]: UnitBeforeHealEvent;
  [UNIT_EVENTS.UNIT_AFTER_HEAL]: UnitAfterHealEvent;
};
