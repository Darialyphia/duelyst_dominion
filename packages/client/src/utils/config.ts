// import type { Point } from '@game/shared';

export const config = {
  CELL: {
    width: 96,
    height: 110,
    toScreenPosition({ x, y }: { x: number; y: number }) {
      return {
        x: x * config.CELL.width,
        y: y * config.CELL.height
      };
    }
  },
  PLAYED_CARD_PREVIEW_TIME: 1000
};
