import { resolveUnitFilter } from '../filters/unit.filters';
import { Action } from './action';

export class BounceUnitsAction extends Action<'bounce_units'> {
  static label = 'Bounce units';

  static description = "Returns target units to their owner's hand.";

  protected async executeImpl(): Promise<void> {
    const units = resolveUnitFilter({
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event,
      filter: this.action.params.units
    });

    for (const unit of units) {
      await unit.bounce();
    }
  }
}
