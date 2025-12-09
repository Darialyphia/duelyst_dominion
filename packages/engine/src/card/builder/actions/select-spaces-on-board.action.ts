import { NoAOEShape } from '../../../aoe/no-aoe.aoe-shape';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import { resolveCellFilter } from '../filters/cell.filters';
import { resolvePlayerFilter } from '../filters/player.filter';
import { getAmount } from '../values/amount';
import { Action } from './action';
import { ACTION_LOOKUP } from './action-lookup';

export class SelectSpacesOnBoardAction extends Action<'select_spaces_on_board'> {
  protected async executeImpl(): Promise<void> {
    const [player] = resolvePlayerFilter({
      ...this.ctx,
      filter: this.action.params.player
    });
    if (!player) return;

    const min = getAmount({
      ...this.ctx,
      amount: this.action.params.min
    });

    const selectedSpaces = await this.game.interaction.selectSpacesOnBoard({
      player,
      source: this.ctx.card,
      getLabel: () => `Select targets for ${this.ctx.card.blueprint.name}`,
      getAoe() {
        return new NoAOEShape(TARGETING_TYPE.ANYWHERE, {});
      },
      canCommit(selectedSpaces) {
        return selectedSpaces.length >= min;
      },
      isDone: selectedSpaces => {
        return selectedSpaces.length === this.action.params.spaces.length;
      },
      isElligible: (candidate, selectedSpaces) => {
        const index = selectedSpaces.length;
        const cellFilter = this.action.params.spaces[index];
        if (!cellFilter) return false;

        const cells = resolveCellFilter({
          ...this.ctx,
          filter: cellFilter,
          selectedCells: selectedSpaces
        });

        return cells.some(c => c.equals(candidate));
      }
    });

    for (const action of this.action.params.actions) {
      const ctor = ACTION_LOOKUP[action.type];
      const instance = new ctor(action, {
        ...this.ctx,
        selectedCells: selectedSpaces
      });

      await instance.execute();
    }
  }
}
