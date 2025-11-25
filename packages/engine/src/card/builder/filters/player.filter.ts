import { resolveFilter, type Filter } from './filter';
import type { Player } from '../../../player/player.entity';
import { match } from 'ts-pattern';
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

export type PlayerFilter =
  | { type: 'ally_player' }
  | { type: 'enemy_player' }
  | { type: 'any_player' }
  | { type: 'current_player' }
  | { type: 'is_manual_target_owner'; params: { index: number } }
  | { type: 'player_1' }
  | { type: 'player_2' }
  | { type: 'attack_target_owner' }
  | { type: 'attack_source_owner' }
  | { type: 'healing_target_owner' }
  | { type: 'healing_source_owner' }
  | { type: 'moved_unit_owner' }
  | { type: 'destroyed_unit_owner' };

type PlayerFilterContext = BuilderContext & { filter: Filter<PlayerFilter> };

export const resolvePlayerFilter = ({
  filter,
  ...ctx
}: PlayerFilterContext): Player[] => {
  return resolveFilter(ctx.game, filter, () => {
    return ctx.game.playerSystem.players.filter(p => {
      return filter.groups.some(group => {
        return group.every(condition => {
          return match(condition)
            .with({ type: 'ally_player' }, () => ctx.card.player.equals(p))
            .with({ type: 'enemy_player' }, () => ctx.card.player.opponent.equals(p))
            .with({ type: 'any_player' }, () => true)
            .with({ type: 'is_manual_target_owner' }, condition => {
              const cell = ctx.targets[condition.params.index];
              if (!cell) return false;
              if (!cell.unit) return false;
              return p.equals(cell.unit.player);
            })
            .with({ type: 'attack_source_owner' }, () => {
              if (
                ctx.event instanceof UnitAttackEvent ||
                ctx.event instanceof UnitDealDamageEvent
              ) {
                return ctx.event.data.unit.player.equals(p);
              }

              if (ctx.event instanceof UnitReceiveDamageEvent) {
                return ctx.event.data.from.player.equals(p);
              }

              return false;
            })
            .with({ type: 'attack_target_owner' }, () => {
              if (ctx.event instanceof UnitAttackEvent) {
                const unit = ctx.game.unitSystem.getUnitAt(ctx.event.data.target);
                return unit ? p.equals(unit.player) : false;
              }

              if (ctx.event instanceof UnitDealDamageEvent) {
                return ctx.event.data.targets.some(t => p.equals(t.player));
              }

              if (ctx.event instanceof UnitReceiveDamageEvent) {
                return p.equals(ctx.event.data.unit.player);
              }

              return false;
            })
            .with({ type: 'healing_source_owner' }, () => {
              if (
                ctx.event instanceof UnitBeforeHealEvent ||
                ctx.event instanceof UnitAfterHealEvent
              ) {
                return ctx.event.data.source.equals(ctx.event.data.unit.player);
              }

              return false;
            })
            .with({ type: 'healing_target_owner' }, () => {
              if (
                ctx.event instanceof UnitBeforeHealEvent ||
                ctx.event instanceof UnitAfterHealEvent
              ) {
                return p.equals(ctx.event.data.unit.player);
              }

              return false;
            })
            .with({ type: 'moved_unit_owner' }, () => {
              if (
                ctx.event instanceof UnitBeforeMoveEvent ||
                ctx.event instanceof UnitAfterMoveEvent
              ) {
                return p.equals(ctx.event.data.unit.player);
              }
              return false;
            })
            .with({ type: 'destroyed_unit_owner' }, () => {
              if (
                ctx.event instanceof UnitBeforeDestroyEvent ||
                ctx.event instanceof UnitAfterDestroyEvent
              ) {
                return p.equals(ctx.event.data.unit.player);
              }
              return false;
            })
            .with({ type: 'current_player' }, () => p.isCurrentPlayer)
            .with({ type: 'player_1' }, () => p.isPlayer1)
            .with({ type: 'player_2' }, () => !p.isPlayer1)
            .exhaustive();
        });
      });
    });
  });
};
