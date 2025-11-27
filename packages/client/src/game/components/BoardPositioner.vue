<script setup lang="ts">
import { isDefined, Vec2, type Point } from '@game/shared';
import {
  useBoardCellByPosition,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { makeAoeShape } from '@game/engine/src/aoe/aoe-shape.factory';

const { x, y } = defineProps<Point>();

const state = useGameState();
const ui = useGameUi();

const isTargetable = computed(() => {
  const interaction = state.value.interaction;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }

  return (
    !isInAoe.value &&
    !isTargeted.value &&
    interaction.ctx.elligibleSpaces.some(
      spaceId => spaceId === pointToCellId({ x, y })
    )
  );
});

const isTargeted = computed(() => {
  const { interaction, phase } = state.value;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }

  if (
    interaction.ctx.selectedSpaces.some(
      space => pointToCellId(space) === pointToCellId({ x, y })
    )
  ) {
    return true;
  }

  if (phase.state === GAME_PHASES.PLAYING_CARD) {
    const card = state.value.entities[phase.ctx.card] as CardViewModel;

    return card.spacesToHighlight.some(point =>
      Vec2.fromPoint(point).equals({ x, y })
    );
  }

  return false;
});

const cell = useBoardCellByPosition(computed(() => ({ x, y })));
const canMoveTo = computed(() => {
  if (!ui.value.selectedUnit) return false;
  return ui.value.selectedUnit.canMoveTo(cell.value);
});

const canAttack = computed(() => {
  if (!ui.value.selectedUnit) return false;

  return ui.value.selectedUnit.canAttackAt(cell.value);
});

const isInAoe = computed(() => {
  const { interaction } = state.value;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }
  if (!interaction.ctx.aoe.shape) return false;
  const shape = makeAoeShape(
    interaction.ctx.aoe.shape.type,
    interaction.ctx.aoe.shape.targetingType,
    interaction.ctx.aoe.shape.params
  );

  const targets = [
    ...interaction.ctx.selectedSpaces,
    ui.value.hoveredCell?.position
  ].filter(isDefined);
  const area = shape.getArea(targets);

  return (
    !isTargeted.value && area.some(point => point.x === x && point.y === y)
  );
});
</script>

<template>
  <div
    class="board-positioner"
    :class="{
      'is-targetable': isTargetable,
      'is-targeted': isTargeted,
      'can-move-to': canMoveTo,
      'can-attack': canAttack,
      'is-in-aoe': isInAoe
    }"
  >
    <slot />
  </div>
</template>

<style scoped lang="postcss">
.board-positioner {
  position: absolute;
  transform: translate(
    calc(var(--board-cell-width) * v-bind(x)),
    calc(var(--board-cell-height) * v-bind(y))
  );
  pointer-events: none;
  width: var(--board-cell-width);
  height: var(--board-cell-height);

  &.is-targetable::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/assets/ui/cell-highlight-targetable.png');
    background-size: cover;
    z-index: 1;
  }
  &.is-targeted::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/assets/ui/cell-highlight-selected.png');
    background-size: cover;
    z-index: 1;
  }
  &.can-move-to::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/assets/ui/cell-highlight-move-reach.png');
    background-size: cover;
    z-index: 1;
  }
  &.can-attack::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/assets/ui/cell-highlight-attackable.png');
    background-size: cover;
    z-index: 1;
  }
  &.is-in-aoe::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/assets/ui/cell-highlight-aoe.png');
    background-size: cover;
    z-index: 1;
  }
}
</style>
