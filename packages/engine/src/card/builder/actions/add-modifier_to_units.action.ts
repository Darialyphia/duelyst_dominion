import type { Modifier } from '../../../modifier/modifier.entity';
import type { Unit } from '../../../unit/unit.entity';
import { resolveUnitFilter } from '../filters/unit.filters';
import { resolveModifier } from '../values/modifier';
import { Action } from './action';

export class AddModifierToUnitsAction extends Action<'add_modifier_to_units'> {
  protected async executeImpl(): Promise<void> {
    const units = resolveUnitFilter({
      ...this.ctx,
      filter: this.action.params.targets
    });

    const modifier = resolveModifier({
      ...this.ctx,
      modifierData: this.action.params.modifier
    });

    for (const unit of units) {
      await unit.modifiers.add(modifier as Modifier<Unit>);
    }
  }
}
