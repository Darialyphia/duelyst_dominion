import type { Nullable } from '@game/shared';
import type { Game } from '../../..';
import type { AnyCard } from '../../entities/card.entity';
import type { ConditionOverrides } from '../conditions';
import {
  resolveCardFilter,
  type CardFilterBase,
  type EventSpecificCardFilter
} from '../filters/card.filters';
import type { Filter } from '../filters/filter';
import { resolvePlayerFilter, type PlayerFilter } from '../filters/player.filter';
import {
  resolveUnitFilter,
  type EventspecificUnitFilter,
  type UnitFilterBase
} from '../filters/unit.filters';
import type { GameEvent } from '../../../game/game.events';
import { match } from 'ts-pattern';
import type { BoardCell } from '../../../board/entities/board-cell.entity';
import { isMinion } from '../../card-utils';

export type Amount<T extends ConditionOverrides> =
  | {
      type: 'fixed';
      params: { value: number };
    }
  | {
      type: 'cards_in_hands';
      params: {
        player: Filter<PlayerFilter>;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'attack';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'lowest_attack';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'highest_attack';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'maxHp';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'hp';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'lowest_hp';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'highest_hp';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'cost';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'card_played_this_turn';
      params: {
        card: Filter<
          CardFilterBase | Extract<EventSpecificCardFilter, { type: T['card'] }>
        >;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'equiped_artifact_count';
      params: {
        player: Filter<PlayerFilter>;
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'destroyed_units';
      params: {
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'missing_cards_in_hand';
      params: {
        add?: number;
        scale?: number;
      };
    }
  | {
      type: 'count_of_units';
      params: {
        unit: Filter<
          UnitFilterBase | Extract<EventspecificUnitFilter, { type: T['unit'] }>
        >;
        add?: number;
        scale?: number;
      };
    };

const withCommonParams = (params: { add?: number; scale?: number }, amount: number) => {
  const scaled = amount * (params.scale ?? 1);
  return scaled + (params.add ?? 0);
};

export const getAmount = ({
  amount,
  ...ctx
}: {
  game: Game;
  card: AnyCard;
  amount: Amount<{ unit: EventspecificUnitFilter['type'] }>;
  targets: Array<Nullable<BoardCell>>;
  event?: GameEvent;
}): number => {
  return match(amount)
    .with({ type: 'fixed' }, amount => amount.params.value)
    .with({ type: 'cards_in_hands' }, amount => {
      const [player] = resolvePlayerFilter({ ...ctx, filter: amount.params.player });
      if (!player) return 0;

      return withCommonParams(amount.params, player.cardManager.hand.length);
    })
    .with({ type: 'cost' }, amount => {
      const [unit] = resolveUnitFilter({
        ...ctx,
        filter: amount.params.unit
      });
      if (!unit) return unit;

      return withCommonParams(amount.params, unit.card.manaCost);
    })
    .with({ type: 'attack' }, amount => {
      const [unit] = resolveUnitFilter({
        ...ctx,
        filter: amount.params.unit
      });
      if (!unit) return unit;
      return withCommonParams(amount.params, unit.atk);
    })
    .with({ type: 'lowest_attack' }, amount => {
      return Math.min(
        ...resolveUnitFilter({
          ...ctx,
          filter: amount.params.unit
        }).map(u => u.atk)
      );
    })
    .with({ type: 'highest_attack' }, amount => {
      return withCommonParams(
        amount.params,
        Math.max(
          ...resolveUnitFilter({
            ...ctx,
            filter: amount.params.unit
          }).map(u => u.atk)
        )
      );
    })
    .with({ type: 'hp' }, amount => {
      const [unit] = resolveUnitFilter({
        ...ctx,
        filter: amount.params.unit
      });
      if (!unit) return unit;
      return withCommonParams(amount.params, unit.remainingHp);
    })
    .with({ type: 'maxHp' }, amount => {
      const [unit] = resolveUnitFilter({
        ...ctx,
        filter: amount.params.unit
      });
      if (!unit) return unit;
      return withCommonParams(amount.params, unit.maxHp);
    })
    .with({ type: 'lowest_hp' }, amount => {
      return withCommonParams(
        amount.params,
        Math.min(
          ...resolveUnitFilter({
            ...ctx,
            filter: amount.params.unit
          }).map(u => u.remainingHp)
        )
      );
    })
    .with({ type: 'highest_hp' }, amount => {
      return withCommonParams(
        amount.params,
        Math.max(
          ...resolveUnitFilter({
            ...ctx,
            filter: amount.params.unit
          }).map(u => u.remainingHp)
        )
      );
    })
    .with({ type: 'card_played_this_turn' }, amount => {
      const cards = resolveCardFilter({ ...ctx, filter: amount.params.card }).filter(
        card => ctx.card.player.cardTracker.cardsPlayedThisTurn.some(c => c.equals(card))
      );

      return withCommonParams(amount.params, cards.length);
    })
    .with({ type: 'equiped_artifact_count' }, amount => {
      const [player] = resolvePlayerFilter({ ...ctx, filter: amount.params.player });

      return withCommonParams(amount.params, player.artifactManager.artifacts.length);
    })
    .with({ type: 'destroyed_units' }, amount => {
      return withCommonParams(
        amount.params,
        ctx.game.cardSystem.cards.filter(c => c.location === 'discardPile' && isMinion(c))
          .length
      );
    })
    .with({ type: 'missing_cards_in_hand' }, amount => {
      return withCommonParams(
        amount.params,
        ctx.game.config.MAX_HAND_SIZE - ctx.card.player.cardManager.hand.length
      );
    })
    .with({ type: 'count_of_units' }, amount => {
      return withCommonParams(
        amount.params,
        resolveUnitFilter({
          ...ctx,
          filter: amount.params.unit
        }).length
      );
    })
    .exhaustive();
};
