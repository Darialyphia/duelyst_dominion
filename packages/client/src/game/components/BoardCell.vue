<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import HexPositioner from './HexPositioner.vue';
const { cell } = defineProps<{
  cell: BoardCellViewModel;
}>();
</script>

<template>
  <HexPositioner :x="cell.x" :y="cell.y" @mouseup="cell.onMouseup">
    <div class="cell" />
  </HexPositioner>
</template>

<style scoped lang="postcss">
.cell {
  background: url('/assets/ui/card-hex.png');
  background-size: cover;
  clip-path: var(--hex-path);

  &:hover {
    filter: brightness(1.5);
  }
}
</style>
