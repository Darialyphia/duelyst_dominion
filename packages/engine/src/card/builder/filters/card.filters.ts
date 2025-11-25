import type { AnyCard } from '../../entities/card.entity';
import { type NumericOperator } from '../values/numeric';
import { getAmount, type Amount } from '../values/amount';
import { resolveBlueprintFilter, type BlueprintFilter } from './blueprint.filter';
import { resolveFilter, type Filter } from './filter';
import { resolvePlayerFilter, type PlayerFilter } from './player.filter';
import { match } from 'ts-pattern';
import { CARD_KINDS, type Tag } from '../../card.enums';
import {
  PlayerAfterDrawEvent,
  PlayerAfterReplaceCardEvent,
  PlayerBeforeReplaceCardEvent
} from '../../../player/player.events';
import type { BuilderContext } from '../schema';

export type CardFilter =
  | { type: 'any_card' }
  | { type: 'self' }
  | { type: 'minion' }
  | { type: 'spell' }
  | { type: 'artifact' }
  | { type: 'index_in_hand'; params: { index: number } }
  | { type: 'in_hand'; params: { player: Filter<PlayerFilter> } }
  | { type: 'in_deck'; params: { player: Filter<PlayerFilter> } }
  | { type: 'in_discard_pile'; params: { player: Filter<PlayerFilter> } }
  | { type: 'from_player'; params: { player: Filter<PlayerFilter> } }
  | { type: 'modifier_source' }
  | { type: 'modifier_target' }
  | {
      type: 'cost';
      params: {
        operator: NumericOperator;
        amount: Amount;
      };
    }
  | { type: 'has_blueprint'; params: { blueprint: Filter<BlueprintFilter> } }
  | { type: 'has_tag'; params: { tag: string } }
  | { type: 'drawn_card' }
  | { type: 'replaced_card' }
  | { type: 'card_replacement' }
  | { type: 'selected_card'; params: { index: number } };

type CardFilterContext = BuilderContext & { filter: Filter<CardFilter> };

export const resolveCardFilter = ({ filter, ...ctx }: CardFilterContext) => {
  return resolveFilter<CardFilter, AnyCard>(ctx.game, filter, () =>
    ctx.game.cardSystem.cards.filter(c => {
      return filter.groups.some(group => {
        return group.every(condition => {
          return match(condition)
            .with({ type: 'any_card' }, () => true)
            .with({ type: 'artifact' }, () => c.kind === CARD_KINDS.ARTIFACT)
            .with({ type: 'spell' }, () => c.kind === CARD_KINDS.SPELL)
            .with({ type: 'minion' }, () => c.kind === CARD_KINDS.MINION)
            .with({ type: 'cost' }, condition => {
              const amount = getAmount({
                ...ctx,
                amount: condition.params.amount
              });
              return match(condition.params.operator)
                .with('equals', () => c.manaCost === amount)
                .with('less_than', () => c.manaCost < amount)
                .with('more_than', () => c.manaCost > amount)
                .exhaustive();
            })
            .with(
              { type: 'index_in_hand' },
              condition => c.player.cardManager.hand[condition.params.index] === c
            )
            .with({ type: 'in_hand' }, () => {
              return c.location === 'hand';
            })
            .with({ type: 'in_deck' }, () => {
              return c.location === 'mainDeck';
            })
            .with({ type: 'in_discard_pile' }, () => {
              return c.location === 'discardPile';
            })
            .with({ type: 'self' }, () => c.equals(ctx.card))
            .with({ type: 'drawn_card' }, () => {
              if (ctx.event instanceof PlayerAfterDrawEvent) {
                return ctx.event.data.cards.some((drawnCard: AnyCard) =>
                  drawnCard.equals(c)
                );
              }

              return false;
            })
            .with({ type: 'replaced_card' }, () => {
              if (
                ctx.event instanceof PlayerBeforeReplaceCardEvent ||
                ctx.event instanceof PlayerAfterReplaceCardEvent
              ) {
                return ctx.event.data.card.equals(c);
              }

              return false;
            })
            .with({ type: 'card_replacement' }, () => {
              if (ctx.event instanceof PlayerAfterReplaceCardEvent) {
                return ctx.event.data.replacement.equals(c);
              }

              return false;
            })
            .with({ type: 'from_player' }, condition => {
              const players = resolvePlayerFilter({
                ...ctx,
                filter: condition.params.player
              });

              return players.some(p => p.equals(c.player));
            })
            .with({ type: 'has_blueprint' }, condition => {
              const blueprints = resolveBlueprintFilter({
                ...ctx,
                filter: condition.params.blueprint
              });
              return blueprints.some(b => b.id === c.blueprintId);
            })
            .with({ type: 'has_tag' }, condition => {
              return (c.blueprint.tags as Tag[]).some(
                tag => tag === condition.params.tag
              );
            })
            .with({ type: 'modifier_source' }, () => {
              if (!ctx.modifier) return false;
              return ctx.modifier.source.equals(c);
            })
            .with({ type: 'modifier_target' }, () => {
              if (!ctx.modifier) return false;
              return ctx.modifier.target?.equals(c) ?? false;
            })
            .with({ type: 'selected_card' }, condition => {
              if (!ctx.selectedCards) return false;
              const selectedCard = ctx.selectedCards[condition.params.index];
              if (!selectedCard) return false;
              return selectedCard.equals(c);
            })
            .exhaustive();
        });
      });
    })
  );
};
