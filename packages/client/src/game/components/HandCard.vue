<script setup lang="ts">
import { Teleport } from 'vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useGameState, useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { usePageLeave } from '@vueuse/core';
import { Flip } from 'gsap/Flip';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

const { card, isInteractive } = defineProps<{
  card: CardViewModel;
  isInteractive: boolean;
}>();

const ui = useGameUi();
const state = useGameState();

const DRAG_THRESHOLD_PX = 100;

const isOutOfScreen = usePageLeave();
const isDragging = ref(false);

const isShaking = ref(false);
const violationWarning = ref('');

const unselectCard = () => {
  const el = document.querySelector('#dragged-card [data-game-card]');
  if (!el) return;

  const flipState = Flip.getState(el);
  ui.value.unselectCard();
  card.cancelPlay();
  window.requestAnimationFrame(() => {
    const target = document.querySelector(
      `.hand-card [data-game-card="${card.id}"]`
    );
    Flip.from(flipState, {
      targets: target,
      duration: 0.25,
      absolute: true,
      ease: Power1.easeOut
    });
  });
};
const onMouseDown = (e: MouseEvent) => {
  if (!card.canPlay) {
    isShaking.value = true;

    setTimeout(() => {
      violationWarning.value = '';
      isShaking.value = false;
    }, 2500);
    return;
  }

  ui.value.selectCard(card);

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
      card.play();
    }
  };

  const onMouseup = () => {
    // if (app.value.view !== e.target) {
    //   ui.value.unselect();
    // }
    unselectCard();
    stopDragging();
  };

  document.body.addEventListener('mousemove', onMousemove);
  document.body.addEventListener('mouseup', onMouseup);
  const unwatch = watch(
    [() => state.value.phase.state, isOutOfScreen, () => ui.value.selectedCard],
    ([newState, outOfScreen, selectedCard]) => {
      if (newState !== GAME_PHASES.PLAYING_CARD) {
        stopDragging();
        unselectCard();
        unwatch();
        return;
      }
      if (outOfScreen && !selectedCard) {
        stopDragging();
        unselectCard();
        unwatch();
        return;
      }
    }
  );
};

const isDetachedFromHand = computed(() => {
  if (isDragging.value) return true;
  return (
    state.value.phase.state === GAME_PHASES.PLAYING_CARD &&
    state.value.phase.ctx.card === card.id &&
    !card.isSelected
  );
});
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
    <component :is="isDetachedFromHand ? Teleport : 'div'" to="#dragged-card">
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
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      box-shadow: inset 0 0 2.5rem lime;
      opacity: 0.35;
      z-index: 2;
    }
  }
  &.disabled {
    filter: brightness(0.8) grayscale(0.5);
  }
  &.is-shaking > * {
    animation: var(--animation-shake-x);
    animation-duration: 0.3s;
  }
}
</style>
