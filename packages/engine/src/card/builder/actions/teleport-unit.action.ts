import { resolveCellFilter } from '../filters/cell.filters';
import { resolveUnitFilter } from '../filters/unit.filters';
import { Action } from './action';

export class TeleportUnitAction extends Action<'teleport_unit'> {
  static label = 'Teleport unit';

  static description = 'Teleports a target unit to a specified destination cell.';

  protected async executeImpl(): Promise<void> {
    const [unit] = resolveUnitFilter({
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event,
      filter: this.action.params.target
    });
    const [destination] = resolveCellFilter({
      game: this.game,
      card: this.card,
      targets: this.targets,
      event: this.event,
      filter: this.action.params.destination
    });
    if (unit && destination) {
      await unit.teleport(destination);
    }
  }
}
