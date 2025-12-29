import { resolveUnitFilter } from '../filters/unit.filters';
import { Action } from './action';

export class ActivateUnitAction extends Action<'activate_unit'> {
  static label = 'Activate unit';

  static description = 'Activates target units, enabling them to act again.';

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
