<script setup lang="ts">
import { Teleport } from 'vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { usePageLeave } from '@vueuse/core';

const { card, isInteractive } = defineProps<{
  card: CardViewModel;
  isInteractive: boolean;
}>();

const ui = useGameUi();

const DRAG_THRESHOLD_PX = 100;

const isOutOfScreen = usePageLeave();
const isDragging = ref(false);

const isShaking = ref(false);
const violationWarning = ref('');

const onMouseDown = (e: MouseEvent) => {
  if (!card.canPlay) {
    isShaking.value = true;

    setTimeout(() => {
      violationWarning.value = '';
      isShaking.value = false;
    }, 2500);
    return;
  }

  ui.value.select(card);

  const startY = e.clientY;

  const stopDragging = () => {
    nextTick(() => {
      isDragging.value = false;
    });
    document.body.removeEventListener('mouseup', onMouseup);
    document.body.removeEventListener('mousemove', onMousemove);
  };

  const onMousemove = (e: MouseEvent) => {
    const deltaY = startY - e.clientY;
    if (deltaY >= DRAG_THRESHOLD_PX && !isDragging.value) {
      isDragging.value = true;
    }
  };

  const onMouseup = () => {
    // if (app.value.view !== e.target) {
    //   ui.value.unselect();
    // }
    ui.value.unselect();
    stopDragging();
  };

  document.body.addEventListener('mousemove', onMousemove);
  document.body.addEventListener('mouseup', onMouseup);
  const unwatch = watchEffect(() => {
    // if (ui.mode !== UI_MODES.PLAY_CARD) {
    //   unwatch();
    //   return;
    // }
    if (isOutOfScreen.value) {
      stopDragging();
      ui.value.unselect();
      unwatch();
    }
  });
};
</script>

<template>
  <div
    class="hand-card"
    :class="{
      selected: ui.selectedCard?.equals(card),
      disabled: !card.canPlay,
      'is-shaking': isShaking
    }"
    @mousedown="onMouseDown($event)"
  >
    <component :is="isDragging ? Teleport : 'div'" to="#dragged-card">
      <GameCard
        :card-id="card.id"
        actions-side="top"
        :actions-offset="15"
        :is-interactive="isInteractive"
        style="--pixel-scale: 1.5"
      />
    </component>
  </div>
</template>

<style scoped lang="postcss">
.hand-card {
  position: absolute;
  left: 0;
  --hover-offset: 30px;
  --offset-y: var(--hover-offset);
  --_y: var(--offset-y);
  transform-origin: 50% 100%;
  transform: translateX(var(--x)) translateY(var(--_y));

  z-index: var(--z);
  transition:
    transform 0.2s var(--ease-2),
    filter 1s var(--ease-2);
  pointer-events: auto;

  &:hover {
    --hover-offset: -110px;
    z-index: var(--hand-size);
  }

  /* &:not(.disabled)::after {
    content: '';
    position: absolute;
    inset: -5px;
    transform: translate(0, 0);
    z-index: -1;
    background: conic-gradient(yellow, orange, magenta, yellow);
    filter: blur(25px);
    animation: selectable-card-hue-rotate 3s linear infinite;
  } */

  &:not(.disabled) {
    box-shadow: 0 0 1rem hsl(from lime h s l / 0.5);
  }
  &.disabled {
    filter: grayscale(0.25) brightness(0.7);
  }
  &.is-shaking > * {
    animation: var(--animation-shake-x);
    animation-duration: 0.3s;
  }
}
</style>
