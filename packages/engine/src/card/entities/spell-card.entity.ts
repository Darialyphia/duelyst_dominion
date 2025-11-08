import type { MaybePromise } from '@game/shared';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import type { RuneCost, SpellBlueprint } from '../card-blueprint';
import { CARD_EVENTS, type Rune } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedSpellCard = SerializedCard & {
  manaCost: number;
  runeCost: RuneCost;
};

export type SpellCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
};

export class SpellCard extends Card<
  SerializedSpellCard,
  SpellCardInterceptors,
  SpellBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable()
      },
      options
    );
  }

  get canAfford() {
    return this.player.canSpendMana(this.manaCost);
  }

  get hasRunes() {
    return Object.entries(this.blueprint.runeCost).every(([rune, cost]) => {
      return this.player.runes[rune as Rune] >= cost;
    });
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.canAfford && this.canAfford && this.blueprint.canPlay(this.game, this),
      this
    );
  }

  removeFromBoard(): Promise<void> {
    return Promise.resolve();
  }

  private async selectTargets() {
    return new Promise<
      { targets: BoardCell[]; cancelled: false } | { cancelled: true; targets?: never }
    >(
      // eslint-disable-next-line no-async-promise-executor
      async resolve => {
        this.cancelPlay = async () => {
          resolve({ cancelled: true });
          await this.game.interaction.getContext().ctx.cancel(this.player);
        };

        await this.removeFromCurrentLocation();

        const targets = await this.blueprint.getTargets(this.game, this);

        resolve({ targets, cancelled: false });
      }
    );
  }

  async play(onCancel: () => MaybePromise<void>) {
    const { targets, cancelled } = await this.selectTargets();
    await this.sendToDiscardPile();

    if (cancelled) {
      await onCancel();
      return;
    }

    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    await this.blueprint.onPlay(this.game, this, {
      targets,
      aoe: this.blueprint.getAoe(this.game, this, targets)
    });

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  serialize() {
    return {
      ...this.serializeBase(),
      manaCost: this.blueprint.manaCost,
      runeCost: this.blueprint.runeCost
    };
  }
}
