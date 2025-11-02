import type { MaybePromise, Nullable } from '@game/shared';
import type { Game } from '../game/game';
import type { Unit } from '../unit/unit.entity';
import type { Tile } from './tile.entity';

export type TileBlueprint = {
  id: string;
  name: string;
  description: string;
  cardIconId: string;
  onCreated?: (session: Game, occupant: Nullable<Unit>, tile: Tile) => void;
  onDestroyed?: (session: Game, occupant: Nullable<Unit>, tile: Tile) => void;
  onEnter?: (session: Game, occupant: Unit, tile: Tile) => MaybePromise<void>;
  onLeave?: (session: Game, occupant: Unit, tile: Tile) => MaybePromise<void>;
};
