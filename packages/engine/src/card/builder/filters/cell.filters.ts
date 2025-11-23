import { isDefined, isEmptyArray, type Nullable, type Point } from '@game/shared';
import type { BoardCell } from '../../../board/entities/board-cell.entity';
import type { Game } from '../../../game/game';
import type { AnyCard } from '../../entities/card.entity';
import { getAmount, type Amount } from '../values/amount';
import { resolveFilter, type Filter } from './filter';
import { resolveUnitFilter, type UnitFilter } from './unit.filters';
import type { GameEvent } from '../../../game/game.events';
import { match } from 'ts-pattern';
import {
  UnitAfterHealEvent,
  UnitAfterMoveEvent,
  UnitAttackEvent,
  UnitBeforeHealEvent,
  UnitBeforeMoveEvent
} from '../../../unit/unit-events';
import { isArtifact, isMinion, isSpell } from '../../card-utils';

export type CellFilter =
  | { type: 'any_cell' }
  | { type: 'is_empty' }
  | { type: 'has_unit'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_at'; params: { x: number; y: number; z: number } }
  | {
      type: 'is_nearby';
      params: { unit?: Filter<UnitFilter>; cell?: Filter<CellFilter> };
    }
  | { type: 'is_in_front'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_behind'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_above'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_same_row'; params: { cell: Filter<CellFilter> } }
  | { type: 'is_same_column'; params: { cell: Filter<CellFilter> } }
  | { type: 'is_below'; params: { unit: Filter<UnitFilter> } }
  | { type: 'is_manual_target'; params: { index: number } }
  | { type: 'is_top_right_corner' }
  | { type: 'is_top_left_corner' }
  | { type: 'is_bottom_right_corner' }
  | { type: 'is_bottom_left_corner' }
  | {
      type: 'in_area';
      params: {
        topLeft: Filter<CellFilter>;
        size: { width: number; height: number };
      };
    }
  | {
      type: 'within_cells';
      params: {
        cell: Filter<CellFilter>;
        amount: Amount;
      };
    }
  | {
      type: 'is_relative_from';
      params: {
        origin: Filter<CellFilter>;
        x: number;
        y: number;
        forwards: number;
        backwards: number;
      };
    }
  | { type: 'in_card_aoe'; params: { not: boolean } }
  | { type: 'moved_unit_old_position' }
  | { type: 'moved_unit_new_position' }
  | { type: 'moved_path' }
  | { type: 'attack_target_position' }
  | { type: 'attack_source_position' }
  | { type: 'heal_target_position' }
  | { type: 'heal_source_position' }
  | { type: 'summon_target' };

export const resolveCellFilter = ({
  filter,
  playedPoint,
  isCardTargeting,
  ...ctx
}: {
  game: Game;
  card: AnyCard;
  filter: Filter<CellFilter>;
  targets: Array<Nullable<BoardCell>>;
  event?: GameEvent;
  playedPoint?: Point;
  isCardTargeting?: boolean;
}): BoardCell[] => {
  return resolveFilter(ctx.game, filter, () => {
    const { targets, game, event } = ctx;

    return game.boardSystem.cells.filter(cell => {
      return filter.groups.some(group => {
        return group.every(filter => {
          return match(filter)
            .with({ type: 'any_cell' }, () => true)
            .with({ type: 'is_manual_target' }, condition => {
              const point = targets[condition.params.index];
              if (!point) return false;
              return cell.position.equals(point);
            })
            .with({ type: 'is_empty' }, () => !cell.unit)
            .with({ type: 'is_nearby' }, condition => {
              const unitFilter = condition.params.unit ?? {
                groups: [],
                type: 'all'
              };
              const cellFilter = condition.params.cell ?? {
                groups: [],
                type: 'all'
              };

              const unitPositions = isEmptyArray(unitFilter.groups)
                ? []
                : resolveUnitFilter({
                    filter: unitFilter,
                    playedPoint,
                    ...ctx
                  }).map(u => u.position);
              const cellPositions = isEmptyArray(cellFilter.groups)
                ? []
                : resolveCellFilter({
                    filter: cellFilter,
                    playedPoint,
                    ...ctx
                  }).map(c => c.position);

              return [...unitPositions, ...cellPositions].some(candidate =>
                game.boardSystem.isNearby(candidate, cell.position)
              );
            })
            .with({ type: 'is_in_front' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                playedPoint,
                ...ctx
              });
              return candidates.some(candidate => cell.isInFront(candidate));
            })
            .with({ type: 'is_behind' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                playedPoint,
                ...ctx
              });
              return candidates.some(candidate => cell.isBehind(candidate));
            })
            .with({ type: 'is_above' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                playedPoint,
                ...ctx
              });
              return candidates.some(candidate => cell.isAbove(candidate));
            })
            .with({ type: 'is_below' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                playedPoint,
                ...ctx
              });
              return candidates.some(candidate => cell.isBelow(candidate));
            })
            .with({ type: 'is_same_row' }, condition => {
              const cells = resolveCellFilter({
                filter: condition.params.cell,
                playedPoint,
                ...ctx
              });

              return cells.some(c => c.y === cell.y);
            })
            .with({ type: 'is_same_column' }, condition => {
              const cells = resolveCellFilter({
                filter: condition.params.cell,
                playedPoint,
                ...ctx
              });

              return cells.some(c => c.x === cell.x);
            })
            .with({ type: 'is_at' }, condition => cell.position.equals(condition.params))
            .with({ type: 'is_top_left_corner' }, () =>
              game.boardSystem.topLeft.equals(cell)
            )
            .with({ type: 'is_top_right_corner' }, () =>
              game.boardSystem.topRight.equals(cell)
            )
            .with({ type: 'is_bottom_left_corner' }, () =>
              game.boardSystem.bottomLeft.equals(cell)
            )
            .with({ type: 'is_bottom_right_corner' }, () =>
              game.boardSystem.bottomRight.equals(cell)
            )
            .with({ type: 'has_unit' }, condition => {
              if (!cell.unit) return false;

              return resolveUnitFilter({
                filter: condition.params.unit,
                playedPoint,
                ...ctx
              })
                .filter(unit => (isCardTargeting ? unit.canBeTargetedBy(ctx.card) : true))
                .some(unit => cell.unit?.equals(unit));
            })
            .with({ type: 'moved_unit_new_position' }, () => {
              if (event instanceof UnitAfterMoveEvent) {
                return event.data.position.equals(cell.position);
              }
              return false;
            })
            .with({ type: 'moved_unit_old_position' }, () => {
              if (event instanceof UnitBeforeMoveEvent) {
                return event.data.position.equals(cell.position);
              }

              if (event instanceof UnitAfterMoveEvent) {
                return event.data.previousPosition.equals(cell.position);
              }

              return false;
            })
            .with({ type: 'moved_path' }, () => {
              if (
                event instanceof UnitBeforeMoveEvent ||
                event instanceof UnitAfterMoveEvent
              ) {
                return event.data.path.some((point: Point) =>
                  cell.position.equals(point)
                );
              }

              return false;
            })
            .with({ type: 'attack_source_position' }, () => {
              if (event instanceof UnitAttackEvent) {
                return event.data.unit.position.equals(cell.position);
              }

              return false;
            })
            .with({ type: 'attack_target_position' }, () => {
              if (event instanceof UnitAttackEvent) {
                return event.data.target.equals(cell.position);
              }

              return false;
            })
            .with({ type: 'heal_source_position' }, () => {
              if (
                event instanceof UnitBeforeHealEvent ||
                event instanceof UnitAfterHealEvent
              ) {
                return event.data.unit.position.equals(cell.position);
              }

              return false;
            })
            .with({ type: 'heal_target_position' }, () => {
              if (
                event instanceof UnitBeforeHealEvent ||
                event instanceof UnitAfterHealEvent
              ) {
                if (!isMinion(event.data.source)) return false;
                return event.data.source.unit?.position.equals(cell.position);
              }

              return false;
            })
            .with({ type: 'summon_target' }, () => {
              if (!playedPoint) return false;
              return cell.position.equals(playedPoint);
            })
            .with({ type: 'in_area' }, condition => {
              const topLefts = resolveCellFilter({
                filter: condition.params.topLeft,
                playedPoint,
                ...ctx
              });

              return topLefts.some(topLeft =>
                game.boardSystem.isInArea(topLeft, condition.params.size, cell)
              );
            })
            .with({ type: 'in_card_aoe' }, () => {
              if (!playedPoint) return false;
              const playedPointCell = game.boardSystem.getCellAt(playedPoint);
              if (!playedPointCell) return false;
              const validTargets = targets.filter(isDefined);
              const hasAllTargets = targets.length === validTargets.length;
              if (!hasAllTargets) return false;

              if (isMinion(ctx.card)) {
                return ctx.card
                  .getAOE(playedPointCell, validTargets)
                  .getArea([playedPointCell, ...validTargets])
                  .some(c => cell.position.equals(c));
              }
              if (isSpell(ctx.card)) {
                return ctx.card
                  .getAOE(validTargets)
                  .getArea(validTargets)
                  .some(c => cell.position.equals(c));
              }
              if (isArtifact(ctx.card)) {
                return ctx.card
                  .getAOE(validTargets)
                  .getArea(validTargets)
                  .some(c => cell.position.equals(c));
              }
              return false;
            })
            .with({ type: 'within_cells' }, condition => {
              const centers = resolveCellFilter({
                filter: condition.params.cell,
                playedPoint,
                ...ctx
              });

              return centers.some(center => {
                const maxDistance = getAmount({
                  amount: condition.params.amount,
                  ...ctx
                });
                return (
                  game.boardSystem.getDistance(center.position, cell.position) <=
                  maxDistance
                );
              });
            })
            .with({ type: 'is_relative_from' }, condition => {
              const [origin] = resolveCellFilter({
                ...ctx,
                playedPoint,
                filter: condition.params.origin
              });
              if (!origin) return false;
              const diff = { x: 0, y: 0 };
              diff.x += condition.params.x;
              diff.y += condition.params.y;
              const isP1 = ctx.card.player.isPlayer1;
              diff.x += condition.params.forwards * (isP1 ? 1 : -1);
              diff.x += condition.params.backwards * (isP1 ? -1 : 1);
              const target = ctx.game.boardSystem.getCellAt({
                x: origin.x + diff.x,
                y: origin.y + diff.y
              });

              return target?.equals(cell);
            })
            .exhaustive();
        });
      });
    });
  });
};
