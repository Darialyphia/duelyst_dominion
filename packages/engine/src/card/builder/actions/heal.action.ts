import { resolveUnitFilter } from '../filters/unit.filters';
import { getAmount } from '../values/amount';
import { Action } from './action';

export class HealAction extends Action<'heal'> {
  static label = 'Heal units';

  static description = 'Heals target units by a specified amount.';

  protected async executeImpl(): Promise<void> {
    const amount = getAmount({
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event,
      amount: this.action.params.amount
    });

    const targets = resolveUnitFilter({
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event,
      filter: this.action.params.targets
    });
    for (const target of targets) {
      await target.heal(this.card, amount);
    }
  }
}
