import { GAME_EVENTS } from '../../game/game.events';
import { AbilityDamage } from '../../utils/damage';
import type { TileBlueprint } from '../tile-blueprint';
import { TILE_EVENTS } from '../tile-enums';

export const shadowCreep: TileBlueprint = {
  id: 'shadow-creep',
  name: 'Shadow Creep',
  description:
    'Deal 2 damage to enemy units that stands on this tile at the end of its turn.',
  sprite: { id: 'tiles/shadow-creep' },
  async onCreated(game, occupant, tile) {
    const cleanups = [
      await game.on(GAME_EVENTS.PLAYER_END_TURN, async event => {
        if (!tile.occupant) return;
        if (!tile.occupant.equals(event.data.player)) return;
        if (tile.occupant.player.equals(tile.player!)) return;

        await tile.occupant.takeDamage(
          tile.player!.general.card,
          new AbilityDamage(tile.player!.general.card, 2)
        );
      }),
      await game.on(TILE_EVENTS.TILE_BEFORE_DESTROY, async event => {
        if (event.data.tile.equals(tile)) {
          cleanups.forEach(cleanup => cleanup());
        }
      })
    ];
  }
};
