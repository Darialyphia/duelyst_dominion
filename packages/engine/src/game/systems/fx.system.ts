import type { EmptyObject, Values } from '@game/shared';
import { System } from '../../system';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { Unit } from '../../unit/unit.entity';

export const ANIMATIONS_NAMES = {
  IDLE: 'idle',
  BREATHING: 'breathing',
  ATTACK: 'attack',
  DEATH: 'death',
  RUN: 'run',
  HIT: 'hit',
  DEFAULT: 'default',
  ACTIVE: 'active',
  CAST_START: 'caststart',
  CAST: 'cast',
  CAST_LOOP: 'castloop',
  CAST_END: 'castend',
  PROJECTILE: 'projectile'
} as const;
export type AnimationName = Values<typeof ANIMATIONS_NAMES>;

export const FX_EVENTS = {
  PLAY_ANIMATION: 'fx.playAnimation'
} as const;
export type FxEvent = Values<typeof FX_EVENTS>;

export type FxEventMap = {
  [FX_EVENTS.PLAY_ANIMATION]: FxPlayAnimation;
};

export class FxSystem extends System<EmptyObject> {
  initialize(): void {}

  shutdown() {}

  async playAnimation(units: Unit[], animation: AnimationName) {
    await this.game.emit(
      FX_EVENTS.PLAY_ANIMATION,
      new FxPlayAnimation({ units, animation })
    );
  }
}

export class FxPlayAnimation extends TypedSerializableEvent<
  { animation: AnimationName; units: Unit[] },
  {
    animation: AnimationName;
    units: string[];
  }
> {
  serialize() {
    return {
      animation: this.data.animation,
      units: this.data.units.map(unit => unit.id)
    };
  }
}
