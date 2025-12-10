<script setup lang="ts">
import type { BlendMode } from '@game/engine/src/game/systems/vfx.system';
import { useGameUi, useVFXStep } from '../composables/useGameClient';
import { waitFor, type Point } from '@game/shared';

type LightConfig = {
  id: number;
  position: Point;
  color: string;
  offset: Point;
  opacity: number;
  radius: number;
  duration: number;
  blendMode: BlendMode;
};
const lights = ref<LightConfig[]>([]);

const ui = useGameUi();

let nextId = 0;

useVFXStep('addLightAt', async light => {
  const cellElement = ui.value.DOMSelectors.cell(
    light.params.position.x,
    light.params.position.y
  ).element;
  if (!cellElement) {
    console.warn(
      'Could not find cell element for position',
      light.params.position
    );
    return;
  }

  const id = nextId++;
  const rect = cellElement.getBoundingClientRect();
  lights.value.push({
    ...light.params,
    id,
    position: {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  });
  await waitFor(light.params.duration);
  lights.value = lights.value.filter(l => l.id !== id);
});
</script>

<template>
  <TransitionGroup>
    <div
      v-for="light in lights"
      :key="light.id"
      class="vfx-light"
      :style="{
        '--light-radius': light.radius + 'px',
        '--light-offset-x': light.offset.x + 'px',
        '--light-offset-y': light.offset.y + 'px',
        '--light-color': light.color,
        '--light-opacity': light.opacity,
        '--light-blend-mode': light.blendMode,
        '--light-top': light.position.y + 'px',
        '--light-left': light.position.x + 'px'
      }"
    />
  </TransitionGroup>
</template>

<style scoped>
.vfx-light {
  position: fixed;
  top: var(--light-top);
  left: var(--light-left);
  width: calc(var(--light-radius) * 2);
  aspect-ratio: 1;
  background: radial-gradient(
    circle at center,
    var(--light-color),
    transparent 50%
  );
  transform: translate(
    calc(-50% + var(--light-offset-x)),
    calc(-50% + var(--light-offset-y))
  );
  opacity: var(--light-opacity);
  mix-blend-mode: var(--light-blend-mode);

  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.5s;
  }
  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}
</style>
