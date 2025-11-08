import type { Point } from '@game/shared';

export const config = {
  HEXES: {
    height: 102,
    width: 144,
    stepX: 94,
    stepY: 51,
    toScreenPosition({ x, y }: Point) {
      return {
        x: x * config.HEXES.stepX,
        y: y * config.HEXES.height + (x % 2 === 0 ? 0 : config.HEXES.stepY)
      };
    }
  }
};
