<script setup lang="ts">
import type { Point } from '@game/shared';

const { x, y } = defineProps<Point>();

const dimensions = { height: 102, width: 144, x: 94, y: 51 };
</script>

<template>
  <div
    class="hex"
    :style="{
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      transform: `translate(${x * dimensions.x}px, ${y * dimensions.height + (x % 2 === 0 ? 0 : dimensions.y)}px)`
    }"
  >
    <slot />
  </div>
</template>

<style scoped lang="postcss">
.hex {
  position: absolute;
  pointer-events: none;
}
:slotted(div) {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}
</style>
