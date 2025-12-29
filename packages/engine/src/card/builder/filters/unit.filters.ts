import { isDefined, isEmptyArray } from '@game/shared';
import { getKeywordById, type KeywordId } from '../../card-keywords';
import type { Tag } from '../../card.enums';
import { matchNumericOperator, type NumericOperator } from '../values/numeric';
import { getAmount, type Amount } from '../values/amount';
import { resolveBlueprintFilter, type BlueprintFilter } from './blueprint.filter';
import { resolveCellFilter, type CellFilter } from './cell.filters';
import { resolveFilter, type Filter } from './filter';
import { match } from 'ts-pattern';
import { isArtifact, isMinion, isMinionOrGeneral, isSpell } from '../../card-utils';
import type { Unit } from '../../../unit/unit.entity';
import {
  UnitAfterDestroyEvent,
  UnitAfterHealEvent,
  UnitAfterMoveEvent,
  UnitAttackEvent,
  UnitBeforeDestroyEvent,
  UnitBeforeHealEvent,
  UnitBeforeMoveEvent,
  UnitDealDamageEvent,
  UnitReceiveDamageEvent
} from '../../../unit/unit-events';
import type { BuilderContext } from '../schema';
import {
  MinionAfterSummonedEvent,
  MinionBeforeSummonedEvent
} from '../../events/minion.events';

export type UnitFilter =
  | { type: 'any_unit' }
  | { type: 'unit_self'; params: { not: boolean } }
  | { type: 'is_general'; params: { not: boolean } }
  | { type: 'is_minion'; params: { not: boolean } }
  | { type: 'is_ally'; params: { not: boolean } }
  | { type: 'is_enemy'; params: { not: boolean } }
  | {
      type: 'is_nearby';
      params: {
        unit?: Filter<UnitFilter>;
        cell?: Filter<CellFilter>;
        not: boolean;
      };
    }
  | { type: 'is_in_front'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_nearest_in_front'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_behind'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_nearest_behind'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_above'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_nearest_above'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_below'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_nearest_below'; params: { unit: Filter<UnitFilter>; not: boolean } }
  | { type: 'is_manual_target'; params: { index: number; not: boolean } }
  | { type: 'is_manual_target_general'; params: { index: number; not: boolean } }
  | { type: 'is_same_row'; params: { cell: Filter<CellFilter>; not: boolean } }
  | { type: 'is_same_column'; params: { cell: Filter<CellFilter>; not: boolean } }
  | { type: 'has_keyword'; params: { keyword: KeywordId; not: boolean } }
  | {
      type: 'has_blueprint';
      params: { blueprint: Filter<BlueprintFilter>; not: boolean };
    }
  | { type: 'has_tag'; params: { tag: Tag; not: boolean } }
  | {
      type: 'has_attack';
      params: {
        amount: Amount;
        operator: NumericOperator;
        not: boolean;
      };
    }
  | {
      type: 'has_hp';
      params: {
        amount: Amount;
        operator: NumericOperator;
        not: boolean;
      };
    }
  | {
      type: 'has_lowest_attack';
      params: { not: false };
    }
  | {
      type: 'has_highest_attack';
      params: { not: false };
    }
  | { type: 'is_exhausted'; params: { not: boolean } }
  | { type: 'is_on_cell'; params: { cell: Filter<CellFilter>; not: boolean } }
  | { type: 'is_on_own_side_of_board'; params: { not: boolean } }
  | { type: 'is_on_opponent_side_of_board'; params: { not: boolean } }
  | { type: 'in_card_aoe'; params: { not: boolean } }
  | { type: 'attack_target'; params: { not: boolean } }
  | { type: 'attack_source'; params: { not: boolean } }
  | { type: 'healing_target'; params: { not: boolean } }
  | { type: 'healing_source'; params: { not: boolean } }
  | { type: 'moved_unit'; params: { not: boolean } }
  | { type: 'destroyed_unit'; params: { not: boolean } }
  | { type: 'modifier_target'; params: { not: boolean } };

type UnitFilterContext = BuilderContext & { filter: Filter<UnitFilter> };

export const resolveUnitFilter = ({ filter, ...ctx }: UnitFilterContext): Unit[] => {
  return resolveFilter(ctx.game, filter, () =>
    ctx.game.unitSystem.units.filter(u => {
      if (!filter.groups.length) return true;

      return filter.groups.some(group => {
        return group.every(condition => {
          const isMatch = match(condition)
            .with({ type: 'any_unit' }, () => true)
            .with({ type: 'has_keyword' }, condition => {
              return u.card.keywordManager.has(getKeywordById(condition.params.keyword)!);
            })
            .with({ type: 'is_ally' }, () => ctx.card.player.equals(u.player))
            .with({ type: 'is_enemy' }, () => !ctx.card.player.equals(u.player))
            .with({ type: 'is_manual_target' }, condition => {
              let unit: Unit | null;
              const point = ctx.targets[condition.params.index];
              if (point) {
                unit = ctx.game.unitSystem.getUnitAt(point);
              } else if (
                ctx.event instanceof MinionBeforeSummonedEvent ||
                ctx.event instanceof MinionAfterSummonedEvent
              ) {
                unit = ctx.event.data.targets[condition.params.index]?.unit;
              } else {
                unit = null;
              }

              if (!unit) return false;
              return u.equals(unit);
            })
            .with({ type: 'is_manual_target_general' }, condition => {
              const point = ctx.targets[condition.params.index];
              if (!point) return false;
              const unit = ctx.game.unitSystem.getUnitAt(point);
              if (!unit) return false;
              return u.equals(unit.player.general);
            })
            .with({ type: 'is_general' }, () => u.isGeneral)
            .with({ type: 'is_minion' }, () => !u.isGeneral)
            .with({ type: 'unit_self' }, () => {
              if (!isMinion(ctx.card)) return false;
              return ctx.card.unit?.equals(u);
            })
            .with({ type: 'is_nearby' }, condition => {
              const unitConditions = condition.params.unit ?? {
                groups: [],
                type: 'all'
              };
              const cellConditions = condition.params.cell ?? {
                groups: [],
                type: 'all'
              };
              const unitPositions = isEmptyArray(unitConditions.groups)
                ? []
                : resolveUnitFilter({
                    ...ctx,
                    filter: unitConditions
                  }).map(u => u.position);
              const cellPositions = isEmptyArray(cellConditions.groups)
                ? []
                : resolveCellFilter({
                    ...ctx,
                    filter: cellConditions
                  }).map(c => c.position);

              return [...unitPositions, ...cellPositions].some(candidate =>
                ctx.game.boardSystem.isNearby(u.position, candidate)
              );
            })
            .with({ type: 'is_in_front' }, condition => {
              const candidates = resolveUnitFilter({
                ...ctx,
                filter: condition.params.unit
              });
              return candidates.some(candidate => candidate.inFront?.unit?.equals(u));
            })
            .with({ type: 'is_nearest_in_front' }, condition => {
              const candidates = resolveUnitFilter({
                ...ctx,
                filter: condition.params.unit
              });
              return candidates.some(candidate =>
                ctx.game.unitSystem.getNearestUnitInFront(u)?.equals(candidate)
              );
            })
            .with({ type: 'is_behind' }, condition => {
              const candidates = resolveUnitFilter({
                ...ctx,
                filter: condition.params.unit
              });
              return candidates.some(candidate => candidate.behind?.unit?.equals(u));
            })
            .with({ type: 'is_nearest_behind' }, condition => {
              const candidates = resolveUnitFilter({
                ...ctx,
                filter: condition.params.unit
              });
              return candidates.some(candidate =>
                ctx.game.unitSystem.getNearestUnitBehind(u)?.equals(candidate)
              );
            })
            .with({ type: 'is_above' }, condition => {
              const candidates = resolveUnitFilter({
                ...ctx,
                filter: condition.params.unit
              });
              return candidates.some(candidate => candidate.above?.unit?.equals(u));
            })
            .with({ type: 'is_nearest_above' }, condition => {
              const candidates = resolveUnitFilter({
                ...ctx,
                filter: condition.params.unit
              });
              return candidates.some(candidate =>
                ctx.game.unitSystem.getNearestUnitAbove(u)?.equals(candidate)
              );
            })
            .with({ type: 'is_below' }, condition => {
              const candidates = resolveUnitFilter({
                ...ctx,
                filter: condition.params.unit
              });
              return candidates.some(candidate => candidate.below?.unit?.equals(u));
            })
            .with({ type: 'is_nearest_below' }, condition => {
              const candidates = resolveUnitFilter({
                ...ctx,
                filter: condition.params.unit
              });
              return candidates.some(candidate =>
                ctx.game.unitSystem.getNearestUnitBelow(u)?.equals(candidate)
              );
            })
            .with({ type: 'moved_unit' }, () => {
              if (
                ctx.event instanceof UnitBeforeMoveEvent ||
                ctx.event instanceof UnitAfterMoveEvent
              ) {
                return u.equals(ctx.event.data.unit);
              }
              return false;
            })
            .with({ type: 'destroyed_unit' }, () => {
              if (
                ctx.event instanceof UnitBeforeDestroyEvent ||
                ctx.event instanceof UnitAfterDestroyEvent
              ) {
                return u.equals(ctx.event.data.unit);
              }
            })
            .with({ type: 'healing_source' }, () => {
              if (
                ctx.event instanceof UnitBeforeHealEvent ||
                ctx.event instanceof UnitAfterHealEvent
              ) {
                return ctx.event.data.source.equals(ctx.card);
              }
            })
            .with({ type: 'healing_target' }, () => {
              if (
                ctx.event instanceof UnitBeforeHealEvent ||
                ctx.event instanceof UnitAfterHealEvent
              ) {
                if (!isMinionOrGeneral(ctx.card)) return false;
                return ctx.event.data.unit.equals(ctx.card.unit!);
              }
            })
            .with({ type: 'attack_source' }, () => {
              if (!isMinionOrGeneral(ctx.card)) return false;
              if (
                ctx.event instanceof UnitAttackEvent ||
                ctx.event instanceof UnitDealDamageEvent
              ) {
                return ctx.event.data.unit.equals(ctx.card.unit);
              }

              if (ctx.event instanceof UnitReceiveDamageEvent) {
                return ctx.event.data.from.equals(ctx.event.data.from.player);
              }
            })
            .with({ type: 'attack_target' }, () => {
              if (ctx.event instanceof UnitAttackEvent) {
                const unit = ctx.game.unitSystem.getUnitAt(ctx.event.data.target);
                return unit ? u.equals(unit) : false;
              }

              if (ctx.event instanceof UnitDealDamageEvent) {
                return ctx.event.data.targets.some(t => u.equals(t));
              }

              if (ctx.event instanceof UnitReceiveDamageEvent) {
                return u.equals(ctx.event.data.unit);
              }

              return false;
            })
            .with({ type: 'has_attack' }, condition => {
              const amount = getAmount({
                ...ctx,
                amount: condition.params.amount
              });

              return matchNumericOperator(u.atk, amount, condition.params.operator);
            })
            .with({ type: 'has_hp' }, condition => {
              const amount = getAmount({
                ...ctx,
                amount: condition.params.amount
              });

              return matchNumericOperator(
                amount,
                u.remainingHp,
                condition.params.operator
              );
            })
            .with({ type: 'is_exhausted' }, () => {
              return u.isExhausted;
            })
            .with({ type: 'has_blueprint' }, condition => {
              const blueprints = resolveBlueprintFilter({
                ...ctx,
                filter: condition.params.blueprint
              });
              return blueprints.some(b => b.id === u.card.blueprintId);
            })
            .with({ type: 'has_tag' }, condition => {
              (u.card.blueprint.tags as Tag[]).some(tag => tag === condition.params.tag);
            })
            .with({ type: 'is_same_row' }, condition => {
              const cells = resolveCellFilter({
                ...ctx,
                filter: condition.params.cell
              });

              return cells.some(c => c.y === u.position.y);
            })
            .with({ type: 'is_same_column' }, condition => {
              const cells = resolveCellFilter({
                ...ctx,
                filter: condition.params.cell
              });

              return cells.some(c => c.x === u.position.x);
            })
            .with({ type: 'has_lowest_attack' }, () => {
              let units: Unit[] = [];
              let lowest = Infinity;
              ctx.game.unitSystem.units.forEach(unit => {
                if (unit.atk < lowest) {
                  units = [unit];
                } else if (unit.atk === lowest) {
                  units.push(unit);
                  lowest = unit.atk;
                }
              });
              return units;
            })
            .with({ type: 'has_highest_attack' }, () => {
              let units: Unit[] = [];
              let highest = -Infinity;
              ctx.game.unitSystem.units.forEach(unit => {
                if (unit.atk > highest) {
                  units = [unit];
                } else if (unit.atk === highest) {
                  units.push(unit);
                  highest = unit.atk;
                }
              });
              return units;
            })
            .with({ type: 'is_on_cell' }, condition => {
              const elligibleCells = resolveCellFilter({
                ...ctx,
                filter: condition.params.cell
              });

              return elligibleCells.some(cell => cell.unit?.equals(u));
            })
            .with({ type: 'is_on_opponent_side_of_board' }, () => {
              return ctx.game.boardSystem
                .getCellAt(u!.position)
                ?.player?.equals(ctx.card.player.opponent);
            })
            .with({ type: 'is_on_own_side_of_board' }, () => {
              return ctx.game.boardSystem
                .getCellAt(u!.position)
                ?.player?.equals(ctx.card.player);
            })
            .with({ type: 'in_card_aoe' }, () => {
              if (!ctx.playedPoint) return false;
              const playedPointCell = ctx.game.boardSystem.getCellAt(ctx.playedPoint);
              if (!playedPointCell) return false;
              const validTargets = ctx.targets.filter(isDefined);
              const hasAllTargets = ctx.targets.length === validTargets.length;
              if (!hasAllTargets) return false;

              if (isMinion(ctx.card)) {
                return ctx.card
                  .getAOE(playedPointCell, validTargets)
                  .getArea([playedPointCell, ...validTargets])
                  .some(c => u.position.equals(c));
              }
              if (isSpell(ctx.card)) {
                return ctx.card
                  .getAOE(validTargets)
                  .getArea(validTargets)
                  .some(c => u.position.equals(c));
              }
              if (isArtifact(ctx.card)) {
                return ctx.card
                  .getAOE(validTargets)
                  .getArea(validTargets)
                  .some(c => u.position.equals(c));
              }
              return false;
            })
            .with({ type: 'modifier_target' }, () => {
              if (!ctx.modifier) return false;
              return ctx.modifier.target?.equals(u) ?? false;
            })
            .exhaustive();

          return 'params' in condition &&
            'not' in condition.params &&
            condition.params.not === true
            ? !isMatch
            : isMatch;
        });
      });
    })
  );
};
