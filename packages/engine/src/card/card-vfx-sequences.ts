import type { Point } from '@game/shared';
import { BLEND_MODES, type VFXSequence } from '../game/systems/vfx.system';

export const lyonarSpawn = (position: Point): VFXSequence => {
  return {
    tracks: [
      {
        steps: [
          {
            type: 'addLightAt',
            params: {
              blendMode: BLEND_MODES.OVERLAY,
              color: '#eadb57',
              position,
              offset: { x: 0, y: -50 },
              opacity: 1,
              duration: 1000,
              radius: 270
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_teleportrecall',
              animationSequence: ['default'],
              offset: { x: 0, y: -25 },
              scale: 1.5
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_f1_inmolation',
              animationSequence: ['default'],
              offset: { x: 0, y: -15 },
              scale: 1.5
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'smokeground',
              animationSequence: ['smokeground'],
              offset: { x: 0, y: 40 },
              scale: 1.5
            }
          }
        ]
      }
    ]
  };
};
