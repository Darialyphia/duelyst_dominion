import type { EmptyObject, Point, Values } from '@game/shared';
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

export const BLEND_MODES = {
  SCREEN: 'screen',
  MULTIPLY: 'multiply',
  OVERLAY: 'overlay',
  COLOR_DODGE: 'color-dodge',
  HARD_LIGHT: 'hard-light',
  SOFT_LIGHT: 'soft-light'
} as const;
export type BlendMode = Values<typeof BLEND_MODES>;

export type VFXStep =
  | {
      type: 'shakeEntity';
      params: {
        units: string[];
        x: boolean;
        y: boolean;
        amplitude: number;
        duration: number;
      };
    }
  | {
      type: 'shakeScreen';
      params: {
        x: boolean;
        y: boolean;
        amplitude: number;
        duration: number;
      };
    }
  | {
      type: 'playSfxOnUnits';
      params: {
        units: string[];
        resourceName: string;
        animationSequence: string[];
        offset: Point;
        duration: number;
      };
    }
  | {
      type: 'playSfxOnScreenCenter';
      params: {
        resourceName: string;
        animationSequence: string[];
        offset: Point;
        duration: number;
      };
    }
  | {
      type: 'tintUnits';
      params: {
        units: string[];
        color: string;
        blendMode: BlendMode;
        opacity: number;
        duration: number;
      };
    }
  | {
      type: 'tintScreen';
      params: {
        color: string;
        blendMode: BlendMode;
        opacity: number;
        duration: number;
      };
    }
  | {
      type: 'addLightOnUnit';
      params: {
        units: string[];
        color: string;
        offset: Point;
        opacity: number;
        radius: number;
        duration: number;
        blendMode: BlendMode;
      };
    }
  | {
      type: 'wait';
      params: {
        duration: number;
      };
    };

export type VFXSequenceTrack = {
  steps: VFXStep[];
};
export type VFXSequence = {
  tracks: VFXSequenceTrack[];
};

export const VFX_EVENTS = {
  PLAY_ANIMATION: 'fx.playAnimation'
} as const;
export type FxEvent = Values<typeof VFX_EVENTS>;

export type FxEventMap = {
  [VFX_EVENTS.PLAY_ANIMATION]: VFXPlayAnimation;
};

export class VFXSystem extends System<EmptyObject> {
  initialize(): void {}

  shutdown() {}

  async playAnimation(units: Unit[], animation: AnimationName) {
    await this.game.emit(
      VFX_EVENTS.PLAY_ANIMATION,
      new VFXPlayAnimation({ units, animation })
    );
  }
}

export class VFXPlayAnimation extends TypedSerializableEvent<
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
