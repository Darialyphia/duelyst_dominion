import { resolveUnitFilter } from '../filters/unit.filters';
import { Action } from './action';

export class DestroyUnitsAction extends Action<'destroy_units'> {
  static label = 'Destroy units';

  static description = 'Destroys target units.';

  protected async executeImpl(): Promise<void> {
    const units = resolveUnitFilter({
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event,
      filter: this.action.params.units
    });

    for (const unit of units) {
      await unit.destroy(this.ctx.card);
    }
  }
}
