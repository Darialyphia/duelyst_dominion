import type { AnyObject, Nullable } from '@game/shared';
import type { BoardCell } from '../../../board/entities/board-cell.entity';
import { checkCondition, type Condition } from '../conditions';
import type { Filter } from '../filters/filter';
import type { UnitFilter } from '../filters/unit.filters';
import type { Amount } from '../values/amount';
import type { Game } from '../../../game/game';
import type { AnyCard } from '../../entities/card.entity';
import { GAME_EVENTS, type GameEvent } from '../../../game/game.events';
import { match } from 'ts-pattern';

type ExecutionTiming = 'now' | 'end_of_turn' | 'start_of_next_turn' | 'end_of_next_turn';

export type SerializedAction = {
  type: 'deal_damage';
  params: {
    targets: Filter<UnitFilter>;
    amount: Amount;
    condition: Filter<Condition>;
    timing: ExecutionTiming;
  };
};

export type ActionContext = {
  game: Game;
  card: AnyCard;
  targets: Nullable<BoardCell>[];
  event?: GameEvent;
};

export abstract class Action<T extends SerializedAction['type']> {
  constructor(
    protected action: SerializedAction & { type: T },
    protected ctx: ActionContext
  ) {}

  protected abstract executeImpl(): Promise<void>;

  get game() {
    return this.ctx.game;
  }

  get card() {
    return this.ctx.card;
  }
  get targets() {
    return this.ctx.targets;
  }

  get event() {
    return this.ctx.event;
  }

  async execute() {
    const shouldExecute = checkCondition({
      conditions: this.action.params.condition,
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event
    });
    if (!shouldExecute) return;

    await this.executeWithTiming(this.action.params.timing);
  }

  private executeWithTiming(timing: ExecutionTiming) {
    return match(timing)
      .with('now', () => this.executeImpl())
      .with('end_of_turn', async () => {
        this.game.once(GAME_EVENTS.PLAYER_END_TURN, async () => {
          await this.executeImpl();
        });
      })
      .with('start_of_next_turn', async () => {
        this.game.once(GAME_EVENTS.PLAYER_START_TURN, async () => {
          await this.executeImpl();
        });
      })
      .with('end_of_next_turn', async () => {
        let turnEnded = false;
        const stop = this.game.on(GAME_EVENTS.PLAYER_END_TURN, async () => {
          if (turnEnded) {
            stop();
            await this.executeImpl();
          } else {
            turnEnded = true;
          }
        });
      })
      .exhaustive();
  }
}
