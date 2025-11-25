import { resolveUnitFilter } from '../filters/unit.filters';
import { Action } from './action';

export class ActivateUnitAction extends Action<'activate_unit'> {
  protected async executeImpl(): Promise<void> {
    const units = resolveUnitFilter({
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event,
      filter: this.action.params.units
    });

    for (const unit of units) {
      await unit.activate();
    }
  }
}
