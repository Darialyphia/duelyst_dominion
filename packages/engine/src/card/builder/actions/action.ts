import { checkCondition, type Condition } from '../conditions';
import type { Filter } from '../filters/filter';
import type { UnitFilter } from '../filters/unit.filters';
import type { Amount } from '../values/amount';
import { GAME_EVENTS } from '../../../game/game.events';
import { match } from 'ts-pattern';
import type { PlayerFilter } from '../filters/player.filter';
import type { CardFilter } from '../filters/card.filters';
import type { BuilderContext } from '../schema';
import type { ModifierData } from '../values/modifier';
import type { BlueprintFilter } from '../filters/blueprint.filter';
import type { CellFilter } from '../filters/cell.filters';

export abstract class Action<T extends SerializedAction['type']> {
  constructor(
    protected action: SerializedAction & { type: T },
    protected ctx: BuilderContext
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

type ExecutionTiming = 'now' | 'end_of_turn' | 'start_of_next_turn' | 'end_of_next_turn';

export type SerializedAction =
  | {
      type: 'deal_damage';
      params: {
        targets: Filter<UnitFilter>;
        amount: Amount;
        condition: Filter<Condition>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'heal';
      params: {
        targets: Filter<UnitFilter>;
        amount: Amount;
        condition: Filter<Condition>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'draw_cards_from_pool';
      params: {
        condition: Filter<Condition>;
        amount: Amount;
        player: Filter<PlayerFilter>;
        timing: ExecutionTiming;
        pool: Filter<CardFilter>;
      };
    }
  | {
      type: 'draw_cards_from_deck';
      params: {
        condition: Filter<Condition>;
        amount: Amount;
        player: Filter<PlayerFilter>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'add_modifier_to_units';
      params: {
        condition: Filter<Condition>;
        modifier: ModifierData;
        targets: Filter<UnitFilter>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'add_modifier_to_cards';
      params: {
        condition: Filter<Condition>;
        modifier: ModifierData;
        targets: Filter<CardFilter>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'activate_unit';
      params: {
        condition: Filter<Condition>;
        units: Filter<UnitFilter>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'destroy_units';
      params: {
        condition: Filter<Condition>;
        units: Filter<UnitFilter>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'bounce_units';
      params: {
        condition: Filter<Condition>;
        units: Filter<CardFilter>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'change_cards_location';
      params: {
        condition: Filter<Condition>;
        cards: Filter<CardFilter>;
        destination: 'hand' | 'mainDeck' | 'discard_pile';
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'generate_cards';
      params: {
        condition: Filter<Condition>;
        blueprint: Filter<BlueprintFilter>;
        player: Filter<PlayerFilter>;
        location: 'hand' | 'deck' | 'discard_pile';
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'teleport_unit';
      params: {
        condition: Filter<Condition>;
        targets: Filter<UnitFilter>;
        destination: Filter<UnitFilter>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'swap_unit_positions';
      params: {
        condition: Filter<Condition>;
        unit1: Filter<UnitFilter>;
        unit2: Filter<UnitFilter>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'select_spaces_on_board';
      params: {
        explainerText: string;
        condition: Filter<Condition>;
        spaces: Array<Filter<CellFilter>>;
        player: Filter<PlayerFilter>;
        timing: ExecutionTiming;
      };
    }
  | {
      type: 'select_cards_from_pool';
      params: {
        explainerText: string;
        condition: Filter<Condition>;
        min: Filter<Amount>;
        max: Filter<Amount>;
        pool: Filter<CardFilter>;
        player: Filter<PlayerFilter>;
        timing: ExecutionTiming;
      };
    };
