import { match } from 'ts-pattern';
import type { TargetingType } from '../../../targeting/targeting-strategy';
import type { UnitFilter } from '../filters/unit.filters';
import { AnywhereTargetingStrategy } from '../../../targeting/anywhere-targeting-strategy';
import { NearbyTargetingStrategy } from '../../../targeting/nearby-targeting-strategy';
import { resolveCellFilter, type CellFilter } from '../filters/cell.filters';
import type { Filter } from '../filters/filter';
import { RangedTargetingStrategy } from '../../../targeting/ranged-targeting.strategy';
import type { BuilderContext } from '../schema';

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

type TargetingContext = BuilderContext & { targeting: SerializedTargeting };

export const getTargeting = ({
  game,
  targeting,
  card,
  targets,
  event
}: TargetingContext) => {
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
