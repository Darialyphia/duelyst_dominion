import type { GenericAOEShape, SerializedAOE } from '../../aoe/aoe-shape';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { MinionCard, SerializedMinionCard } from '../entities/minion-card.entity';
import type { Point, Values } from '@game/shared';

export const MINION_EVENTS = {
  MINION_BEFORE_SUMMON: 'minion:before-summon',
  MINION_AFTER_SUMMON: 'minion:after-summon'
} as const;
export type MinionEvent = Values<typeof MINION_EVENTS>;

export class MinionSummonedEvent extends TypedSerializableEvent<
  { card: MinionCard; cell: BoardCell; targets: BoardCell[]; aoe: GenericAOEShape },
  { card: SerializedMinionCard; position: Point; targets: Point[]; aoe: SerializedAOE }
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

export type MinionEventMap = {
  [MINION_EVENTS.MINION_BEFORE_SUMMON]: MinionSummonedEvent;
  [MINION_EVENTS.MINION_AFTER_SUMMON]: MinionSummonedEvent;
};
