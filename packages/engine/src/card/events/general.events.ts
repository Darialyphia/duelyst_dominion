import type { Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { GeneralCard } from '../entities/general-card.entity';

export const GENERAL_EVENTS = {
  GENERAL_BEFORE_USE_ABILITY: 'general:before-use-ability',
  GENERAL_AFTER_USE_ABILITY: 'general:after-use-ability'
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

export type GeneralEventMap = {
  [GENERAL_EVENTS.GENERAL_BEFORE_USE_ABILITY]: GeneralUseAbilityEvent;
  [GENERAL_EVENTS.GENERAL_AFTER_USE_ABILITY]: GeneralUseAbilityEvent;
};
