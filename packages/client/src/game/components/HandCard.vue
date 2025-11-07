<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const { card, isInteractive } = defineProps<{
  card: CardViewModel;
  isInteractive: boolean;
}>();

const ui = useGameUi();
</script>

<template>
  <div
    class="hand-card"
    :class="{
      selected: ui.selectedCard?.equals(card),
      disabled: !card.canPlay
    }"
  >
    <GameCard
      :card-id="card.id"
      actions-side="top"
      :actions-offset="15"
      :is-interactive="isInteractive"
      style="--pixel-scale: 1.5"
    />
  </div>
</template>

<style scoped lang="postcss">
@keyframes selectable-card-hue-rotate {
  to {
    filter: blur(25px) hue-rotate(360deg);
  }
}
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

  &.disabled {
    filter: grayscale(0.25) brightness(0.7);
  }
}
</style>
