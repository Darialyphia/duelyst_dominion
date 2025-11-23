import { match } from 'ts-pattern';
import type { TargetingType } from '../../../targeting/targeting-strategy';
import type { UnitFilter } from '../filters/unit.filters';
import { AnywhereTargetingStrategy } from '../../../targeting/anywhere-targeting-strategy';
import type { AnyCard } from '../../entities/card.entity';
import type { Game } from '../../../game/game';
import { NearbyTargetingStrategy } from '../../../targeting/nearby-targeting-strategy';
import { resolveCellFilter, type CellFilter } from '../filters/cell.filters';
import type { Nullable } from '@game/shared';
import type { BoardCell } from '../../../board/entities/board-cell.entity';
import type { GameEvent } from '../../../game/game.events';
import type { Filter } from '../filters/filter';
import { RangedTargetingStrategy } from '../../../targeting/ranged-targeting.strategy';

export type SerializedTargeting =
  | {
      type: 'anywhere';
      params: {
        targetingType: TargetingType;
      };
    }
  | {
      type: 'nearby';
      params: {
        units: UnitFilter;
        targetingType: TargetingType;
        origins: Filter<CellFilter>;
      };
    }
  | {
      type: 'ranged';
      params: {
        minRange: number;
        maxRange: number;
        origins: Filter<CellFilter>;
        targetingType: TargetingType;
      };
    };

export const getTargeting = ({
  game,
  targeting,
  card,
  targets,
  event
}: {
  game: Game;
  targeting: SerializedTargeting;
  card: AnyCard;
  targets: Array<Nullable<BoardCell>>;
  event?: GameEvent;
}) => {
  return match(targeting)
    .with(
      { type: 'anywhere' },
      t => new AnywhereTargetingStrategy(game, card.player, t.params.targetingType)
    )
    .with(
      { type: 'nearby' },
      t =>
        new NearbyTargetingStrategy(
          game,
          card.player,
          () =>
            resolveCellFilter({
              game,
              card,
              targets,
              event,
              filter: t.params.origins
            }),
          t.params.targetingType
        )
    )
    .with(
      { type: 'ranged' },
      t =>
        new RangedTargetingStrategy(
          game,
          card,
          () =>
            resolveCellFilter({
              game,
              card,
              targets,
              event,
              filter: t.params.origins
            }),
          t.params.targetingType,
          {
            minRange: t.params.minRange,
            maxRange: t.params.maxRange
          }
        )
    )
    .exhaustive();
};
