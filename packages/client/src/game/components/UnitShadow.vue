<script setup lang="ts">
const {
  bgPosition,
  imageBg,
  spriteWidth,
  spriteHeight,
  sheetWidth,
  sheetHeight,
  isFlipped
} = defineProps<{
  bgPosition: string;
  imageBg: string;
  spriteWidth: number;
  spriteHeight: number;
  sheetWidth: number;
  sheetHeight: number;
  isFlipped: boolean;
}>();
</script>

<template>
  <div
    class="shadow-wrapper"
    :class="{
      'is-flipped': isFlipped
    }"
    :style="{
      '--parallax-factor': 0.5,
      '--bg-position': bgPosition,
      '--width': `${spriteWidth}px`,
      '--height': `${spriteHeight}px`,
      '--background-width': `calc( ${sheetWidth}px * var(--pixel-scale))`,
      '--background-height': `calc(${sheetHeight}px * var(--pixel-scale))`
    }"
  >
    <div class="shadow" />
  </div>
</template>

<style scoped lang="postcss">
.shadow-wrapper {
  --pixel-scale: 1;
  pointer-events: none;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  position: absolute;
  bottom: 0;
  left: 50%;
  translate: -50% 0;
  scale: 2;
  transform-origin: bottom center;
  transform-style: preserve-3d;
}

.shadow {
  width: 100%;
  height: 100%;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  pointer-events: none;
  position: absolute;
  transform: translateZ(1px) scaleY(-1) translateY(45%) skewX(15deg);
  transform-origin: bottom center;
  filter: brightness(0);
  opacity: 0.25;

  .is-flipped & {
    translate: 12.5% 0;
  }
}
</style>
