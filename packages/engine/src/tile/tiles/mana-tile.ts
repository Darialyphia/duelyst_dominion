import type { TileBlueprint } from '../tile-blueprint';

export const manaTile: TileBlueprint = {
  id: 'mana-tile',
  name: 'Mana Tile',
  description: 'A tile that provides extra mana when a unit walks on it.',
  sprite: { id: 'tiles/mana-tile' },
  async onCreated(session, occupant, tile) {}
};
