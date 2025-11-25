import type { EmptyObject } from '@game/shared';
import { CARD_KINDS, type Faction } from '../../card.enums';
import { matchNumericOperator, type NumericOperator } from '../values/numeric';
import { getAmount, type Amount } from '../values/amount';
import { resolveCardFilter, type CardFilter } from './card.filters';
import { resolveFilter, type Filter } from './filter';
import { resolveUnitFilter, type UnitFilter } from './unit.filters';
import type { CardBlueprint } from '../../card-blueprint';
import { match } from 'ts-pattern';
import type { BuilderContext } from '../schema';

export type BlueprintFilter =
  | { type: 'equals'; params: { blueprints: string[] } }
  | { type: 'from_unit'; params: { unit: Filter<UnitFilter> } }
  | { type: 'from_card'; params: { card: Filter<CardFilter> } }
  | { type: 'minion'; params: EmptyObject }
  | { type: 'spell'; params: EmptyObject }
  | { type: 'artifact'; params: EmptyObject }
  | {
      type: 'cost';
      params: {
        operator: NumericOperator;
        amount: Amount;
      };
    }
  | { type: 'has_tag'; params: { tag: string } }
  | { type: 'from_faction'; params: { factions: (Faction | null)[] } };

type BlueprintFilterContext = BuilderContext & { filter: Filter<BlueprintFilter> };

export const resolveBlueprintFilter = ({
  game: game,
  card,
  targets,
  filter,
  event
}: BlueprintFilterContext): CardBlueprint[] => {
  return resolveFilter(game, filter, () =>
    Object.values(game.cardPool).filter(blueprint => {
      return filter.groups.some(group => {
        return group.every(condition => {
          return match(condition)
            .with({ type: 'equals' }, condition => {
              return condition.params.blueprints.includes(blueprint.id);
            })
            .with({ type: 'from_unit' }, condition => {
              const units = resolveUnitFilter({
                filter: condition.params.unit,
                targets,
                game,
                card,
                event
              });

              return units.some(unit => unit.card.blueprintId === blueprint.id);
            })
            .with({ type: 'from_card' }, condition => {
              const cards = resolveCardFilter({
                filter: condition.params.card,
                targets,
                game,
                card,
                event
              });

              return cards.some(card => card.blueprintId === blueprint.id);
            })
            .with({ type: 'minion' }, () => blueprint.kind === CARD_KINDS.MINION)
            .with({ type: 'spell' }, () => blueprint.kind === CARD_KINDS.SPELL)
            .with({ type: 'artifact' }, () => blueprint.kind === CARD_KINDS.ARTIFACT)
            .with({ type: 'cost' }, condition => {
              const amount = getAmount({
                game,
                card,
                targets,
                amount: condition.params.amount,
                event
              });
              const manaCost =
                blueprint.kind in
                [CARD_KINDS.MINION, CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT]
                  ? (blueprint as any).manaCost
                  : 999;
              return matchNumericOperator(amount, manaCost, condition.params.operator);
            })
            .with({ type: 'has_tag' }, condition => {
              return blueprint.tags?.some(tag => tag === condition.params.tag);
            })

            .with({ type: 'from_faction' }, condition => {
              return condition.params.factions.includes(
                (blueprint.faction as Faction) ?? null
              );
            })
            .exhaustive();
        });
      });
    })
  );
};
