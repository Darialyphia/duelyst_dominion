import { resolvePlayerFilter } from '../filters/player.filter';
import { getAmount } from '../values/amount';
import { Action } from './action';

export class DrawCardsFromDeckAction extends Action<'draw_cards_from_deck'> {
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
      await player.cardManager.drawFromDeck(amount);
    }
  }
}
