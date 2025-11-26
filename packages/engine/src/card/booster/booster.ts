import type { Rarity } from '../card.enums';

export type BoosterPack = {
  getContents: (options: {
    packSize: number;
    blueprintWeightModifier: (blueprintId: string) => number;
    rarityWeightModifier: (rarity: Rarity) => number;
  }) => Array<{
    blueprintId: string;
    isFoil: boolean;
  }>;
};
