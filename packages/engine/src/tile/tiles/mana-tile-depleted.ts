import type { TileBlueprint } from '../tile-blueprint';

export const manaTileDepleted: TileBlueprint = {
  id: 'mana-tile-depleted',
  name: 'Mana Tile',
  description: 'A tile that provides extra mana when a unit walks on it. Depleted.',
  sprite: { id: 'tiles/mana-tile-depleted' },
  async onCreated() {}
};
