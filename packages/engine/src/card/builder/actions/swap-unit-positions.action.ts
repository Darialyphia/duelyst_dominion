import { resolveUnitFilter } from '../filters/unit.filters';
import { Action } from './action';

export class SwapUnitPositionsAction extends Action<'swap_unit_positions'> {
  protected async executeImpl(): Promise<void> {
    const [unit1] = resolveUnitFilter({
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event,
      filter: this.action.params.unit1
    });
    const [unit2] = resolveUnitFilter({
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event,
      filter: this.action.params.unit2
    });

    if (unit1 && unit2) {
      await unit1.teleport(unit2.position);
      await unit2.teleport(unit1.position);
    }
  }
}
