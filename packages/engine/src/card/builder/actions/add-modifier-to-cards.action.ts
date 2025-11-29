import type { Modifier } from '../../../modifier/modifier.entity';
import type { AnyCard } from '../../entities/card.entity';
import { resolveCardFilter } from '../filters/card.filters';
import { resolveModifier } from '../values/modifier';
import { Action } from './action';

export class AddModifierToCardsAction extends Action<'add_modifier_to_cards'> {
  protected async executeImpl(): Promise<void> {
    const cards = resolveCardFilter({
      ...this.ctx,
      filter: this.action.params.targets
    });
    const modifier = resolveModifier({
      ...this.ctx,
      modifierData: this.action.params.modifier
    });

    for (const card of cards) {
      await card.modifiers.add(modifier as Modifier<AnyCard>);
    }
  }
}
