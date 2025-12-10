<script setup lang="ts">
import { useGameUi, useVFXStep } from '../composables/useGameClient';
import { type Point } from '@game/shared';
import SpriteFX from './SpriteFX.vue';

type SpriteConfig = {
  id: number;
  position: Point;
  resourceName: string;
  animationSequence: string[];
  offset: Point;
  scale: number;
  flipX: boolean;
};
const sprites = ref<SpriteConfig[]>([]);

const ui = useGameUi();

let nextId = 0;

const promisesResolversById = new Map<number, () => void>();

useVFXStep('playSpriteAt', async step => {
  return new Promise<void>(resolve => {
    const cellElement = ui.value.DOMSelectors.cell(
      step.params.position.x,
      step.params.position.y
    ).element;

    if (!cellElement) {
      console.warn(
        'Could not find cell element for position',
        step.params.position
      );
      resolve();
      return;
    }

    const id = nextId++;
    const rect = cellElement.getBoundingClientRect();
    sprites.value.push({
      ...step.params,
      id,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    });
    promisesResolversById.set(id, () => {
      sprites.value = sprites.value.filter(s => s.id !== id);
      resolve();
    });
  });
});
</script>

<template>
  <div
    class="vfx-sprite"
    :class="sprite.flipX && 'is-flipped'"
    v-for="sprite in sprites"
    :key="sprite.id"
    :style="{
      '--sprite-top': sprite.position.y + 'px',
      '--sprite-left': sprite.position.x + 'px'
    }"
  >
    <SpriteFX
      :sprites="[
        {
          spriteId: sprite.resourceName,
          animationSequence: sprite.animationSequence,
          scale: sprite.scale,
          offset: sprite.offset
        }
      ]"
      @end="promisesResolversById.get(sprite.id)?.()"
    />
  </div>
</template>

<style scoped lang="postcss">
.vfx-sprite {
  position: fixed;
  top: var(--sprite-top);
  left: var(--sprite-left);
  outline: solid 1px red; /* for debugging */
  &.is-flipped {
    transform-origin: center center;
    transform: scaleX(-1);
  }
}
</style>
