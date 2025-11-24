import { AbilityDamage, SpellDamage } from '../../../utils/damage';
import { isSpell } from '../../card-utils';
import { resolveUnitFilter } from '../filters/unit.filters';
import { getAmount } from '../values/amount';
import { Action } from './action';

export class DealDamageAction extends Action<'deal_damage'> {
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
      await target.takeDamage(
        this.card,
        isSpell(this.card)
          ? new SpellDamage(this.card, amount)
          : new AbilityDamage(this.card, amount)
      );
    }
  }
}
