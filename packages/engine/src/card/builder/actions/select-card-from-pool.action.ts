import { resolvePlayerFilter } from '../filters/player.filter';
import { getAmount } from '../values/amount';
import { Action } from './action';
import { ACTION_LOOKUP } from './action-lookup';
import { resolveCardFilter } from '../filters/card.filters';

export class SelectCardsFromPoolAction extends Action<'select_cards_from_pool'> {
  protected async executeImpl(): Promise<void> {
    const [player] = resolvePlayerFilter({
      ...this.ctx,
      filter: this.action.params.player
    });
    if (!player) return;

    const min = getAmount({
      ...this.ctx,
      amount: this.action.params.min
    });

    const max = getAmount({
      ...this.ctx,
      amount: this.action.params.max
    });

    const selectedcards = await this.game.interaction.chooseCards({
      player,
      label: this.action.params.label,
      minChoiceCount: min,
      maxChoiceCount: max,
      source: this.ctx.card,
      choices: resolveCardFilter({
        ...this.ctx,
        filter: this.action.params.pool
      })
    });

    for (const action of this.action.params.actions) {
      const ctor = ACTION_LOOKUP[action.type];
      const instance = new ctor(action, {
        ...this.ctx,
        selectedCards: selectedcards
      });

      await instance.execute();
    }
  }
}
