<script setup lang="ts">
import { type Point } from '@game/shared';
import { useGameState } from '../composables/useGameClient';

const { x, y } = defineProps<Point & { canHighlight?: boolean }>();

const state = useGameState();

// hack to add a separation between players, Ill figure a cleaner way engine side later
const offsetedY = computed(() => (y >= state.value.board.rows / 2 ? y + 1 : y));
</script>

<template>
  <div class="board-positioner">
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
.board-positioner {
  position: absolute;
  transform: translateX(calc(var(--board-cell-width) * v-bind(x)))
    translateY(calc(var(--board-cell-height) * v-bind(offsetedY)))
    translateZ(0.1px);
  pointer-events: none;
  width: var(--board-cell-width);
  height: var(--board-cell-height);
  z-index: v-bind(y);
  transform-style: preserve-3d;

  * {
    display: none;
  }
}
</style>
