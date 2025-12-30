<script setup lang="ts">
import { useEventListener, useRafFn } from '@vueuse/core';
import { useGameClient, useGameState } from '../composables/useGameClient';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

const target = ref({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

const light = ref({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

const easing = 0.1;

useEventListener(window, 'mousemove', (e: MouseEvent) => {
  target.value.x = e.clientX;
  target.value.y = e.clientY;
});

useRafFn(() => {
  const dx = target.value.x - light.value.x;
  const dy = target.value.y - light.value.y;

  light.value.x += dx * easing;
  light.value.y += dy * easing;
});

const state = useGameState();
const { client } = useGameClient();
</script>

<template>
  <div
    v-if="state.phase.state === GAME_PHASES.PLAYING_CARD && !client.isPlayingFx"
    class="light"
    :style="{
      left: `${light.x}px`,
      top: `${light.y}px`
    }"
  />
</template>

<style scoped lang="postcss">
.light {
  position: fixed;
  width: 500px;
  aspect-ratio: 1;
  background: radial-gradient(
    circle,
    var(--yellow-2) 0%,
    rgb(from var(--yellow-2) r g b / 0.25) 40%,
    rgba(255, 255, 200, 0) 75%
  );
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  mix-blend-mode: overlay;
}
</style>
