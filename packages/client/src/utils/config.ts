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
  // HEXES: {
  //   height: 102,
  //   width: 144,
  //   stepX: 94,
  //   stepY: 51,
  //   toScreenPosition({ x, y }: Point) {
  //     return {
  //       x: x * config.HEXES.stepX,
  //       y: y * config.HEXES.height + (x % 2 === 0 ? 0 : config.HEXES.stepY)
  //     };
  //   }
  // }
};
