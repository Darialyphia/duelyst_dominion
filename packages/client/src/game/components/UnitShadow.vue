<script setup lang="ts">
import { config } from '@/utils/config';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { mapRange, Vec2 } from '@game/shared';
import { useEventListener } from '@vueuse/core';
import { useGameUi } from '../composables/useGameClient';

const {
  unit,
  bgPosition,
  imageBg,
  spriteWidth,
  spriteHeight,
  sheetWidth,
  sheetHeight,
  isFlipped
} = defineProps<{
  unit: UnitViewModel;
  bgPosition: string;
  imageBg: string;
  spriteWidth: number;
  spriteHeight: number;
  sheetWidth: number;
  sheetHeight: number;
  isFlipped: boolean;
}>();
const ui = useGameUi();
const unitPosition = computed(() => {
  const raw = config.CELL.toScreenPosition(unit.position);
  const board = ui.value.DOMSelectors.board.element;
  if (!board) return raw;

  const boardRect = board.getBoundingClientRect();
  return new Vec2(raw.x + boardRect.left, raw.y + boardRect.top);
});

const mouseX = ref(window.innerWidth / 2);
const mouseY = ref(window.innerHeight / 2);

useEventListener(window, 'mousemove', (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
});

const distance = computed(() => {
  const unitScreenPos = unitPosition.value;

  return new Vec2(mouseX.value, mouseY.value).dist(unitScreenPos);
});
const maxdistance = Math.sqrt(
  window.innerWidth * window.innerWidth +
    (window.innerHeight * window.innerHeight) / 4
);

const distanceX = computed(() => {
  return mouseX.value - unitPosition.value.x;
});
const maxDistanceX = window.innerWidth;

const blur = computed(() => mapRange(distance.value, [0, maxdistance], [0, 3]));
const opacity = computed(() =>
  mapRange(distance.value, [0, maxdistance], [0.7, 0.45])
);
const skewX = computed(() => {
  const angle = mapRange(
    distanceX.value,
    [-maxDistanceX, maxDistanceX],
    [-35, 35]
  );
  return isFlipped ? -angle : angle;
});
const scaleY = computed(() => {
  return mapRange(distance.value, [0, maxdistance], [0.75, 1.1]) * -1;
});
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
    <div class="shadow-blur" />
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
  &.is-flipped {
    transform: scaleX(-1);
  }
}

:is(.shadow, .shadow-blur) {
  width: 100%;
  height: 100%;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  pointer-events: none;
  position: absolute;
  transform-origin: 50% calc(100% - 16px);
  transform: translateZ(1px)
    scaleY(calc(var(--scale-factor) * v-bind('`${scaleY}`')))
    skewX(v-bind('`${skewX}deg`'));
  opacity: calc(v-bind(opacity) * var(--opacity-factor));
}

.shadow {
  --scale-factor: 1;
  --opacity-factor: 0.5;
  filter: brightness(0) blur(v-bind('`${blur}px`'));
  mask-image: linear-gradient(to top, black, black 15%, transparent 70%);
}
.shadow-blur {
  --scale-factor: 1.25;
  --opacity-factor: 0.75;
  filter: brightness(0) url(#shadow-blur);
  mask-image: linear-gradient(to top, transparent, black 20%);
}
</style>
