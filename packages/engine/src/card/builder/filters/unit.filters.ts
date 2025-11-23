import { isDefined, isEmptyArray, type Nullable, type Point } from '@game/shared';
import { getKeywordById, type KeywordId } from '../../card-keywords';
import type { Tag } from '../../card.enums';
import { matchNumericOperator, type NumericOperator } from '../conditions';
import { getAmount, type Amount } from '../values/amount';
import { resolveBlueprintFilter, type BlueprintFilter } from './blueprint.filter';
import type { EventSpecificCardFilter } from './card.filters';
import { resolveCellFilter, type CellFilter } from './cell.filters';
import { resolveFilter, type Filter } from './filter';
import type { GameEvent } from '../../../game/game.events';
import type { Game } from '../../../game/game';
import { match } from 'ts-pattern';
import { isArtifact, isMinion, isMinionOrGeneral, isSpell } from '../../card-utils';
import type { BoardCell } from '../../../board/entities/board-cell.entity';
import type { AnyCard } from '../../entities/card.entity';
import type { PlayerArtifact } from '../../../player/player-artifact.entity';
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
import type { Entity } from '../../../entity';

export type UnitFilterBase =
  | { type: 'any_unit' }
  | { type: 'is_self'; params: { not: boolean } }
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
        amount: Amount<{
          unit: EventspecificUnitFilter['type'];
          card: EventSpecificCardFilter['type'];
        }>;
        operator: NumericOperator;
        not: boolean;
      };
    }
  | {
      type: 'has_hp';
      params: {
        amount: Amount<{
          unit: EventspecificUnitFilter['type'];
          card: EventSpecificCardFilter['type'];
        }>;
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
  | { type: 'artifact_owner'; params: { not: boolean } }
  | { type: 'in_card_aoe'; params: { not: boolean } };

export type EventspecificUnitFilter =
  | { type: 'attack_target'; params: { not: boolean } }
  | { type: 'attack_source'; params: { not: boolean } }
  | { type: 'healing_target'; params: { not: boolean } }
  | { type: 'healing_source'; params: { not: boolean } }
  | { type: 'moved_unit'; params: { not: boolean } }
  | { type: 'destroyed_unit'; params: { not: boolean } };

export type UnitFilter = UnitFilterBase | EventspecificUnitFilter;

export const resolveUnitFilter = ({
  game,
  filter,
  targets,
  event,
  card,
  playedPoint,
  artifact
}: {
  game: Game;
  card: AnyCard;
  filter: Filter<UnitFilter>;
  targets: Array<Nullable<BoardCell>>;
  event?: GameEvent;
  playedPoint?: Point;
  artifact?: PlayerArtifact;
}): Unit[] => {
  return resolveFilter(game, filter, () =>
    game.unitSystem.units.filter(u => {
      if (!filter.groups.length) return true;

      return filter.groups.some(group => {
        return group.every(condition => {
          const isMatch = match(condition)
            .with({ type: 'any_unit' }, () => true)
            .with({ type: 'has_keyword' }, condition => {
              return u.card.keywordManager.has(getKeywordById(condition.params.keyword)!);
            })
            .with({ type: 'is_ally' }, () => card.player.equals(u.player))
            .with({ type: 'is_enemy' }, () => !card.player.equals(u.player))
            .with({ type: 'is_manual_target' }, condition => {
              const point = targets[condition.params.index];
              if (!point) return false;
              const unit = game.unitSystem.getUnitAt(point);
              if (!unit) return false;
              return u.equals(unit);
            })
            .with({ type: 'is_manual_target_general' }, condition => {
              const point = targets[condition.params.index];
              if (!point) return false;
              const unit = game.unitSystem.getUnitAt(point);
              if (!unit) return false;
              return u.equals(unit.player.general);
            })
            .with({ type: 'is_general' }, () => u.isGeneral)
            .with({ type: 'is_minion' }, () => !u.isGeneral)
            .with({ type: 'is_self' }, () => {
              if (!isMinion(card)) return false;
              return card.unit?.equals(u);
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
                    filter: unitConditions,
                    targets,
                    game,
                    card,
                    event
                  }).map(u => u.position);
              const cellPositions = isEmptyArray(cellConditions.groups)
                ? []
                : resolveCellFilter({
                    filter: cellConditions,
                    targets,
                    game,
                    card,
                    event,
                    playedPoint
                  }).map(c => c.position);

              return [...unitPositions, ...cellPositions].some(candidate =>
                game.boardSystem.isNearby(u.position, candidate)
              );
            })
            .with({ type: 'is_in_front' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                targets,
                game: game,
                card,
                event
              });
              return candidates.some(candidate => candidate.inFront?.unit?.equals(u));
            })
            .with({ type: 'is_nearest_in_front' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                targets,
                game,
                card,
                event
              });
              return candidates.some(candidate =>
                game.unitSystem.getNearestUnitInFront(u)?.equals(candidate)
              );
            })
            .with({ type: 'is_behind' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                targets,
                game: game,
                card,
                event
              });
              return candidates.some(candidate => candidate.behind?.unit?.equals(u));
            })
            .with({ type: 'is_nearest_behind' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                targets,
                game,
                card,
                event
              });
              return candidates.some(candidate =>
                game.unitSystem.getNearestUnitBehind(u)?.equals(candidate)
              );
            })
            .with({ type: 'is_above' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                targets,
                game: game,
                card,
                event
              });
              return candidates.some(candidate => candidate.above?.unit?.equals(u));
            })
            .with({ type: 'is_nearest_above' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                targets,
                game: game,
                card,
                event
              });
              return candidates.some(candidate =>
                game.unitSystem.getNearestUnitAbove(u)?.equals(candidate)
              );
            })
            .with({ type: 'is_below' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                targets,
                game: game,
                card,
                event
              });
              return candidates.some(candidate => candidate.below?.unit?.equals(u));
            })
            .with({ type: 'is_nearest_below' }, condition => {
              const candidates = resolveUnitFilter({
                filter: condition.params.unit,
                targets,
                game: game,
                card,
                event
              });
              return candidates.some(candidate =>
                game.unitSystem.getNearestUnitBelow(u)?.equals(candidate)
              );
            })
            .with({ type: 'moved_unit' }, () => {
              if (
                event instanceof UnitBeforeMoveEvent ||
                event instanceof UnitAfterMoveEvent
              ) {
                return u.equals(event.data.unit);
              }
              return false;
            })
            .with({ type: 'destroyed_unit' }, () => {
              if (
                event instanceof UnitBeforeDestroyEvent ||
                event instanceof UnitAfterDestroyEvent
              ) {
                return u.equals(event.data.unit);
              }
            })
            .with({ type: 'healing_source' }, () => {
              if (
                event instanceof UnitBeforeHealEvent ||
                event instanceof UnitAfterHealEvent
              ) {
                return event.data.source.equals(card);
              }
            })
            .with({ type: 'healing_target' }, () => {
              if (
                event instanceof UnitBeforeHealEvent ||
                event instanceof UnitAfterHealEvent
              ) {
                if (!isMinionOrGeneral(card)) return false;
                return event.data.unit.equals(card.unit!);
              }
            })
            .with({ type: 'attack_source' }, () => {
              if (!isMinionOrGeneral(card)) return false;
              if (
                event instanceof UnitAttackEvent ||
                event instanceof UnitDealDamageEvent
              ) {
                return event.data.unit.equals(card.unit);
              }

              if (event instanceof UnitReceiveDamageEvent) {
                return event.data.from.equals(event.data.from.player);
              }
            })
            .with({ type: 'attack_target' }, () => {
              if (event instanceof UnitAttackEvent) {
                const unit = game.unitSystem.getUnitAt(event.data.target);
                return unit ? u.equals(unit) : false;
              }

              if (event instanceof UnitDealDamageEvent) {
                return event.data.targets.some(t => u.equals(t));
              }

              if (event instanceof UnitReceiveDamageEvent) {
                return u.equals(event.data.unit);
              }

              return false;
            })
            .with({ type: 'has_attack' }, condition => {
              const amount = getAmount({
                amount: condition.params.amount,
                targets,
                game,
                card,
                event
              });

              return matchNumericOperator(u.atk, amount, condition.params.operator);
            })
            .with({ type: 'has_hp' }, condition => {
              const amount = getAmount({
                amount: condition.params.amount,
                targets,
                game,
                card,
                event
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
                game,
                card,
                targets,
                filter: condition.params.blueprint,
                event
              });
              return blueprints.some(b => b.id === u.card.blueprintId);
            })
            .with({ type: 'has_tag' }, condition => {
              (u.card.blueprint.tags as Tag[]).some(tag => tag === condition.params.tag);
            })
            .with({ type: 'is_same_row' }, condition => {
              const cells = resolveCellFilter({
                targets,
                game,
                card,
                event,
                filter: condition.params.cell
              });

              return cells.some(c => c.y === u.position.y);
            })
            .with({ type: 'is_same_column' }, condition => {
              const cells = resolveCellFilter({
                targets,
                game,
                card,
                event,
                filter: condition.params.cell
              });

              return cells.some(c => c.x === u.position.x);
            })
            .with({ type: 'has_lowest_attack' }, () => {
              let units: Unit[] = [];
              let lowest = Infinity;
              game.unitSystem.units.forEach(unit => {
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
              game.unitSystem.units.forEach(unit => {
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
                filter: condition.params.cell,
                targets,
                game,
                card,
                event,
                playedPoint
              });

              return elligibleCells.some(cell => cell.unit?.equals(u));
            })
            .with({ type: 'is_on_opponent_side_of_board' }, () => {
              return game.boardSystem
                .getCellAt(u!.position)
                ?.player?.equals(card.player.opponent);
            })
            .with({ type: 'is_on_own_side_of_board' }, () => {
              return game.boardSystem.getCellAt(u!.position)?.player?.equals(card.player);
            })
            .with({ type: 'artifact_owner' }, () => {
              if (!artifact) return false;
              return u.equals(artifact?.player.general);
            })
            .with({ type: 'in_card_aoe' }, () => {
              if (!playedPoint) return false;
              const playedPointCell = game.boardSystem.getCellAt(playedPoint);
              if (!playedPointCell) return false;
              const validTargets = targets.filter(isDefined);
              const hasAllTargets = targets.length === validTargets.length;
              if (!hasAllTargets) return false;

              if (isMinion(card)) {
                return card
                  .getAOE(playedPointCell, validTargets)
                  .getArea([playedPointCell, ...validTargets])
                  .some(c => u.position.equals(c));
              }
              if (isSpell(card)) {
                return card
                  .getAOE(validTargets)
                  .getArea(validTargets)
                  .some(c => u.position.equals(c));
              }
              if (isArtifact(card)) {
                return card
                  .getAOE(validTargets)
                  .getArea(validTargets)
                  .some(c => u.position.equals(c));
              }
              return false;
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
