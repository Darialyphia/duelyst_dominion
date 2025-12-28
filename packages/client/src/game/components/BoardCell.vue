<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import { useGameUi } from '../composables/useGameClient';
import BoardPositioner from './BoardPositioner.vue';

const { cell } = defineProps<{
  cell: BoardCellViewModel;
}>();

const ui = useGameUi();
</script>

<template>
  <BoardPositioner
    :x="cell.position.x"
    :y="cell.position.y"
    @mouseenter="ui.hover(cell)"
    @mouseleave="ui.unhover()"
    @mouseup="ui.onBoardCellClick(cell, $event)"
  >
    <div
      class="cell"
      :id="ui.DOMSelectors.cell(cell.position.x, cell.position.y).id"
    />
  </BoardPositioner>
</template>

<style scoped lang="postcss">
.cell {
  background: url('@/assets/ui/board-cell.png');
  background-size: cover;
  width: 100%;
  height: 100%;
  pointer-events: auto;

  &:hover {
    filter: brightness(1.5);
  }
}
</style>
