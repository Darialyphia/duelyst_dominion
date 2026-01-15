import type { Point, Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { GeneralCard, SerializedGeneralCard } from '../entities/general-card.entity';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import type { GenericAOEShape, SerializedAOE } from '../../aoe/aoe-shape';
import type { SerializedUnit, Unit } from '../../unit/unit.entity';

export const GENERAL_EVENTS = {
  GENERAL_BEFORE_USE_ABILITY: 'general:before-use-ability',
  GENERAL_AFTER_USE_ABILITY: 'general:after-use-ability',
  GENERAL_BEFORE_SUMMON: 'general:before-summon',
  GENERAL_AFTER_SUMMON: 'general:after-summon'
} as const;
export type GeneralEvent = Values<typeof GENERAL_EVENTS>;

export class GeneralUseAbilityEvent extends TypedSerializableEvent<
  { card: GeneralCard; abilityId: string },
  { card: string; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.id,
      abilityId: this.data.abilityId
    };
  }
}

export class GeneralBeforeSummonedEvent extends TypedSerializableEvent<
  { card: GeneralCard; cell: BoardCell; targets: BoardCell[]; aoe: GenericAOEShape },
  { card: SerializedGeneralCard; position: Point; targets: Point[]; aoe: SerializedAOE }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      position: this.data.cell.position.serialize(),
      targets: this.data.targets.map(target => target.position.serialize()),
      aoe: this.data.aoe.serialize()
    };
  }
}

export class GeneralAfterSummonedEvent extends TypedSerializableEvent<
  { card: GeneralCard; unit: Unit; targets: BoardCell[]; aoe: GenericAOEShape },
  {
    card: SerializedGeneralCard;
    unit: SerializedUnit;
    targets: Point[];
    aoe: SerializedAOE;
  }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      unit: this.data.unit.serialize(),
      targets: this.data.targets.map(target => target.position.serialize()),
      aoe: this.data.aoe.serialize()
    };
  }
}

export type GeneralEventMap = {
  [GENERAL_EVENTS.GENERAL_BEFORE_USE_ABILITY]: GeneralUseAbilityEvent;
  [GENERAL_EVENTS.GENERAL_AFTER_USE_ABILITY]: GeneralUseAbilityEvent;
  [GENERAL_EVENTS.GENERAL_BEFORE_SUMMON]: GeneralBeforeSummonedEvent;
  [GENERAL_EVENTS.GENERAL_AFTER_SUMMON]: GeneralAfterSummonedEvent;
};
