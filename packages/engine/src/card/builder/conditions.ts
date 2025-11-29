import { match } from 'ts-pattern';
import { resolveCardFilter, type CardFilter } from './filters/card.filters';
import type { Filter } from './filters/filter';
import { resolvePlayerFilter, type PlayerFilter } from './filters/player.filter';
import { getAmount, type Amount } from './values/amount';
import { getKeywordById, type KeywordId } from '../card-keywords';
import { resolveCellFilter, type CellFilter } from './filters/cell.filters';
import { resolveUnitFilter, type UnitFilter } from './filters/unit.filters';
import { matchNumericOperator, type NumericOperator } from './values/numeric';
import type { Unit } from '../../unit/unit.entity';
import type { BuilderContext } from './schema';

export type Condition =
  | { type: 'active_player'; params: { player: Filter<PlayerFilter> } }
  | { type: 'target_exists'; params: { index: number } }
  | {
      type: 'player_mana';
      params: {
        player: Filter<PlayerFilter>;
        operator: NumericOperator;
        amount: Amount;
      };
    }
  | {
      type: 'player_hp';
      params: {
        player: Filter<PlayerFilter>;
        operator: NumericOperator;
        amount: Amount;
      };
    }
  | {
      type: 'player_cards_in_hand';
      params: {
        player: Filter<PlayerFilter>;
        operator: NumericOperator;
        amount: Amount;
      };
    }
  | {
      type: 'unit_equals';
      params: { unitA: Filter<UnitFilter>; unitB: Filter<UnitFilter> };
    }
  | {
      type: 'unit_attack';
      params: {
        mode: 'all' | 'some' | 'none';
        unit: Filter<UnitFilter>;
        operator: NumericOperator;
        amount: Amount;
      };
    }
  | {
      type: 'unit_hp';
      params: {
        mode: 'all' | 'some' | 'none';
        unit: Filter<UnitFilter>;
        operator: NumericOperator;
        amount: Amount;
      };
    }
  | {
      type: 'unit_position';
      params: {
        mode: 'all' | 'some' | 'none';
        unit: Filter<UnitFilter>;
        cells: Filter<CellFilter>;
      };
    }
  | {
      type: 'unit_keyword';
      params: {
        mode: 'all' | 'some' | 'none';
        unit: Filter<UnitFilter>;
        keyword: KeywordId;
      };
    }
  | {
      type: 'player_has_more_minions';
      params: {
        player: Filter<PlayerFilter>;
      };
    }
  | {
      type: 'cards_played_this_turn';
      params: {
        card: Filter<CardFilter>;
        operator: NumericOperator;
        amount: Amount;
      };
    };

type ConditionContext = BuilderContext & { conditions: Filter<Condition> | undefined };
export const checkCondition = ({
  conditions,
  game,
  card,
  targets,
  event
}: ConditionContext): boolean => {
  if (!conditions) return true;
  if (!conditions.groups.length) return true;

  return conditions.groups.some(group => {
    return group.every(condition => {
      return match(condition)
        .with({ type: 'active_player' }, condition => {
          const [player] = resolvePlayerFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.player
          });

          return player.isActive;
        })
        .with({ type: 'player_mana' }, condition => {
          const amount = getAmount({
            game,
            card,
            targets,
            event,
            amount: condition.params.amount
          });
          return resolvePlayerFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.player
          }).every(player =>
            matchNumericOperator(player.mana, amount, condition.params.operator)
          );
        })
        .with({ type: 'player_hp' }, condition => {
          const amount = getAmount({
            game,
            card,
            targets,
            event,
            amount: condition.params.amount
          });
          return resolvePlayerFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.player
          }).every(player =>
            matchNumericOperator(
              player.general.remainingHp,
              amount,
              condition.params.operator
            )
          );
        })
        .with({ type: 'unit_equals' }, condition => {
          const unitsA = resolveUnitFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.unitA
          });
          const unitsB = resolveUnitFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.unitB
          });

          return unitsA.some(unitA => unitsB.some(unitB => unitA.equals(unitB)));
        })
        .with({ type: 'unit_attack' }, condition => {
          const units = resolveUnitFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.unit
          });
          const amount = getAmount({
            game,
            card,
            targets,
            event,
            amount: condition.params.amount
          });

          const isMatch = (u: Unit) =>
            matchNumericOperator(u.atk, amount, condition.params.operator);

          return match(condition.params.mode)
            .with('all', () => units.every(isMatch))
            .with('none', () => units.every(e => !isMatch(e)))
            .with('some', () => units.some(isMatch))
            .exhaustive();
        })
        .with({ type: 'unit_hp' }, condition => {
          const units = resolveUnitFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.unit
          });
          const amount = getAmount({
            game,
            card,
            targets,
            event,
            amount: condition.params.amount
          });

          const isMatch = (u: Unit) =>
            matchNumericOperator(u.remainingHp, amount, condition.params.operator);

          return match(condition.params.mode)
            .with('all', () => units.every(isMatch))
            .with('none', () => units.every(e => !isMatch(e)))
            .with('some', () => units.some(isMatch))
            .exhaustive();
        })
        .with({ type: 'unit_position' }, condition => {
          const units = resolveUnitFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.unit
          });
          const cells = resolveCellFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.cells
          });

          const isMatch = (u: Unit) => {
            return cells.some(cell => cell.position.equals(u.position));
          };

          return match(condition.params.mode)
            .with('all', () => units.every(isMatch))
            .with('none', () => units.every(e => !isMatch(e)))
            .with('some', () => units.some(isMatch))
            .exhaustive();
        })
        .with({ type: 'unit_keyword' }, condition => {
          const units = resolveUnitFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.unit
          });

          const isMatch = (u: Unit) =>
            u.card.keywordManager.has(getKeywordById(condition.params.keyword)!);
          return match(condition.params.mode)
            .with('all', () => units.every(isMatch))
            .with('none', () => units.every(e => !isMatch(e)))
            .with('some', () => units.some(isMatch))
            .exhaustive();
        })
        .with({ type: 'target_exists' }, condition => {
          return !!targets[condition.params.index];
        })
        .with({ type: 'player_has_more_minions' }, condition => {
          const [player] = resolvePlayerFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.player
          });

          return player.units.length > player.opponent.units.length;
        })
        .with({ type: 'cards_played_this_turn' }, condition => {
          const amount = getAmount({
            game,
            card,
            targets,
            event,
            amount: condition.params.amount
          });

          const cards = resolveCardFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.card
          }).filter(card =>
            card.player.cardTracker.cardsPlayedThisTurn.some(c => c.equals(card))
          );

          return matchNumericOperator(cards.length, amount, condition.params.operator);
        })
        .with({ type: 'player_cards_in_hand' }, condition => {
          const amount = getAmount({
            game,
            card,
            targets,
            event,
            amount: condition.params.amount
          });
          return resolvePlayerFilter({
            game,
            card,
            event,
            targets,
            filter: condition.params.player
          }).every(player =>
            matchNumericOperator(
              player.cardManager.hand.length,
              amount,
              condition.params.operator
            )
          );
        })
        .exhaustive();
    });
  });
};
