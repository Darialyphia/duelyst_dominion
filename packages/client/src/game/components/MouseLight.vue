<script setup lang="ts">
import { useEventListener, useRafFn } from '@vueuse/core';
import { useGameState } from '../composables/useGameClient';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

const targetX = ref(window.innerWidth / 2);
const targetY = ref(window.innerHeight / 2);

const lightX = ref(window.innerWidth / 2);
const lightY = ref(window.innerHeight / 2);

// Configuration for smooth movement
const easing = 0.08; // Lower = more delay/smoothness

useEventListener(window, 'mousemove', (e: MouseEvent) => {
  targetX.value = e.clientX;
  targetY.value = e.clientY;
});

// Use requestAnimationFrame for smooth 60fps animation
useRafFn(() => {
  // Calculate distance to target
  const dx = targetX.value - lightX.value;
  const dy = targetY.value - lightY.value;

  // Apply easing directly to position (no velocity/friction for overshoot)
  lightX.value += dx * easing;
  lightY.value += dy * easing;
});

const state = useGameState();
</script>

<template>
  <div
    v-if="state.phase.state === GAME_PHASES.PLAYING_CARD"
    class="light"
    :style="{
      left: `${lightX}px`,
      top: `${lightY}px`
    }"
  />
</template>

<style scoped lang="postcss">
.light {
  position: fixed;
  width: 800px;
  aspect-ratio: 1;
  background: radial-gradient(
    circle,
    var(--yellow-2) 0%,
    rgba(255, 255, 200, 0) 60%
  );
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  mix-blend-mode: overlay;
}
</style>
