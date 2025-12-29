import type { DeckCard } from '../../components/card-manager.component';
import { resolveCardFilter } from '../filters/card.filters';
import { resolvePlayerFilter } from '../filters/player.filter';
import { getAmount } from '../values/amount';
import { Action } from './action';

export class DrawCardsFromPoolAction extends Action<'draw_cards_from_pool'> {
  static label = 'Draw cards from pool';

  static description = 'Draws cards from a specified card pool.';

  protected async executeImpl(): Promise<void> {
    const amount = getAmount({
      ...this.ctx,
      amount: this.action.params.amount
    });

    const players = resolvePlayerFilter({
      ...this.ctx,
      filter: this.action.params.player
    });

    for (const player of players) {
      const cardPool = resolveCardFilter({
        ...this.ctx,
        filter: this.action.params.pool
      }) as DeckCard[];

      await player.cardManager.drawFromPool(cardPool, amount);
    }
  }
}
