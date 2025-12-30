<script setup lang="ts">
import {
  useGameUi,
  useMyPlayer,
  useOpponentPlayer
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { useGlobalSounds } from '../composables/useGlobalSounds';

const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();

useGlobalSounds();

const ui = useGameUi();
const hoveredCard = computed(() => {
  if (!ui.value.hoveredCell) return null;
  return ui.value.hoveredCell.unit?.getCard();
});
</script>

<template>
  <Transition>
    <div
      class="hovered-card"
      v-if="hoveredCard"
      :key="hoveredCard.id"
      :class="{
        ally: hoveredCard.getPlayer().equals(myPlayer),
        enemy: hoveredCard.getPlayer().equals(opponent)
      }"
    >
      <GameCard :card-id="hoveredCard.id" :is-interactive="false" />
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.hovered-card {
  --pixel-scale: 1.5;
  position: fixed;
  bottom: var(--size-14);
  pointer-events: none;
  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.2s var(--ease-3),
      opacity 0.2s var(--ease-3);
  }
  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
  &.ally {
    left: var(--size-6);
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(-20%);
    }
  }
  &.enemy {
    right: var(--size-6);
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(20%);
    }
  }
}
</style>
