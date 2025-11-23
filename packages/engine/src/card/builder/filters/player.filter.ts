import type { Nullable } from '@game/shared';
import type { AnyCard } from '../../entities/card.entity';
import { resolveFilter, type Filter } from './filter';
import type { GameEvent } from '../../../game/game.events';
import type { Game } from '../../../game/game';
import type { Player } from '../../../player/player.entity';
import { match } from 'ts-pattern';
import type { BoardCell } from '../../../board/entities/board-cell.entity';
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

export const resolvePlayerFilter = ({
  game,
  card,
  targets,
  filter,
  event
}: {
  game: Game;
  card: AnyCard;
  targets: Array<Nullable<BoardCell>>;
  filter: Filter<PlayerFilter>;
  event?: GameEvent;
}): Player[] => {
  return resolveFilter(game, filter, () => {
    return game.playerSystem.players.filter(p => {
      return filter.groups.some(group => {
        return group.every(condition => {
          return match(condition)
            .with({ type: 'ally_player' }, () => card.player.equals(p))
            .with({ type: 'enemy_player' }, () => card.player.opponent.equals(p))
            .with({ type: 'any_player' }, () => true)
            .with({ type: 'is_manual_target_owner' }, condition => {
              const cell = targets[condition.params.index];
              if (!cell) return false;
              if (!cell.unit) return false;
              return p.equals(cell.unit.player);
            })
            .with({ type: 'attack_source_owner' }, () => {
              if (
                event instanceof UnitAttackEvent ||
                event instanceof UnitDealDamageEvent
              ) {
                return event.data.unit.player.equals(p);
              }

              if (event instanceof UnitReceiveDamageEvent) {
                return event.data.from.player.equals(p);
              }

              return false;
            })
            .with({ type: 'attack_target_owner' }, () => {
              if (event instanceof UnitAttackEvent) {
                const unit = game.unitSystem.getUnitAt(event.data.target);
                return unit ? p.equals(unit.player) : false;
              }

              if (event instanceof UnitDealDamageEvent) {
                return event.data.targets.some(t => p.equals(t.player));
              }

              if (event instanceof UnitReceiveDamageEvent) {
                return p.equals(event.data.unit.player);
              }

              return false;
            })
            .with({ type: 'healing_source_owner' }, () => {
              if (
                event instanceof UnitBeforeHealEvent ||
                event instanceof UnitAfterHealEvent
              ) {
                return event.data.source.equals(event.data.unit.player);
              }

              return false;
            })
            .with({ type: 'healing_target_owner' }, () => {
              if (
                event instanceof UnitBeforeHealEvent ||
                event instanceof UnitAfterHealEvent
              ) {
                return p.equals(event.data.unit.player);
              }

              return false;
            })
            .with({ type: 'moved_unit_owner' }, () => {
              if (
                event instanceof UnitBeforeMoveEvent ||
                event instanceof UnitAfterMoveEvent
              ) {
                return p.equals(event.data.unit.player);
              }
              return false;
            })
            .with({ type: 'destroyed_unit_owner' }, () => {
              if (
                event instanceof UnitBeforeDestroyEvent ||
                event instanceof UnitAfterDestroyEvent
              ) {
                return p.equals(event.data.unit.player);
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
