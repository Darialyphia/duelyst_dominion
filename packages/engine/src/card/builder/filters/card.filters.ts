import type { Nullable } from '@game/shared';
import type { BoardCell } from '../../../board/entities/board-cell.entity';
import type { Game } from '../../../game/game';
import type { AnyCard } from '../../entities/card.entity';
import { type NumericOperator } from '../values/numeric';
import { getAmount, type Amount } from '../values/amount';
import { resolveBlueprintFilter, type BlueprintFilter } from './blueprint.filter';
import { resolveFilter, type Filter } from './filter';
import { resolvePlayerFilter, type PlayerFilter } from './player.filter';
import type { GameEvent } from '../../../game/game.events';
import { match } from 'ts-pattern';
import { CARD_KINDS, type Tag } from '../../card.enums';
import {
  PlayerAfterDrawEvent,
  PlayerAfterReplaceCardEvent,
  PlayerBeforeReplaceCardEvent
} from '../../../player/player.events';

export type CardFilter =
  | { type: 'any_card' }
  | { type: 'self' }
  | { type: 'minion' }
  | { type: 'spell' }
  | { type: 'artifact' }
  | { type: 'index_in_hand'; params: { index: number } }
  | { type: 'in_hand' }
  | { type: 'in_deck' }
  | { type: 'in_discard_pile' }
  | { type: 'from_player'; params: { player: Filter<PlayerFilter> } }
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
  | { type: 'card_replacement' };

export const resolveCardFilter = ({
  game,
  card,
  filter,
  targets,
  event
}: {
  game: Game;
  card: AnyCard;
  filter: Filter<CardFilter>;
  targets: Array<Nullable<BoardCell>>;
  event?: GameEvent;
}) => {
  return resolveFilter<CardFilter, AnyCard>(game, filter, () =>
    game.cardSystem.cards.filter(c => {
      return filter.groups.some(group => {
        return group.every(condition => {
          return match(condition)
            .with({ type: 'any_card' }, () => true)
            .with({ type: 'artifact' }, () => c.kind === CARD_KINDS.ARTIFACT)
            .with({ type: 'spell' }, () => c.kind === CARD_KINDS.SPELL)
            .with({ type: 'minion' }, () => c.kind === CARD_KINDS.MINION)
            .with({ type: 'cost' }, condition => {
              const amount = getAmount({
                game,
                card,
                targets,
                amount: condition.params.amount,
                event
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
            .with({ type: 'self' }, () => c.equals(card))
            .with({ type: 'drawn_card' }, () => {
              if (event instanceof PlayerAfterDrawEvent) {
                return event.data.cards.some((drawnCard: AnyCard) => drawnCard.equals(c));
              }

              return false;
            })
            .with({ type: 'replaced_card' }, () => {
              if (
                event instanceof PlayerBeforeReplaceCardEvent ||
                event instanceof PlayerAfterReplaceCardEvent
              ) {
                return event.data.card.equals(c);
              }

              return false;
            })
            .with({ type: 'card_replacement' }, () => {
              if (event instanceof PlayerAfterReplaceCardEvent) {
                return event.data.replacement.equals(c);
              }

              return false;
            })
            .with({ type: 'from_player' }, condition => {
              const players = resolvePlayerFilter({
                game,
                card,
                targets,
                filter: condition.params.player,
                event
              });

              return players.some(p => p.equals(c.player));
            })
            .with({ type: 'has_blueprint' }, condition => {
              const blueprints = resolveBlueprintFilter({
                game,
                card,
                targets,
                filter: condition.params.blueprint,
                event
              });
              return blueprints.some(b => b.id === c.blueprintId);
            })
            .with({ type: 'has_tag' }, condition => {
              return (c.blueprint.tags as Tag[]).some(
                tag => tag === condition.params.tag
              );
            })
            .exhaustive();
        });
      });
    })
  );
};
