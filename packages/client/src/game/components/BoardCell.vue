<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import HexPositioner from './HexPositioner.vue';
import { useGameUi } from '../composables/useGameClient';

const { cell } = defineProps<{
  cell: BoardCellViewModel;
}>();

const ui = useGameUi();
</script>

<template>
  <HexPositioner
    :x="cell.x"
    :y="cell.y"
    @mouseup="ui.onBoardCellClick(cell, $event)"
  >
    <div class="cell" />
  </HexPositioner>
</template>

<style scoped lang="postcss">
.cell {
  background: url('/assets/ui/card-hex.png');
  background-size: cover;
  clip-path: var(--hex-path);
  width: 100%;
  height: 100%;
  pointer-events: auto;

  &:hover {
    filter: brightness(1.5);
  }
}
</style>
