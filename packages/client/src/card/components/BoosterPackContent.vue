<script setup lang="ts">
import { computed } from 'vue';
import {
  provideBoosterPack,
  type BoosterPackCardEntry
} from '../composables/useBoosterPack';
import BoosterPackCard from './BoosterPackCard.vue';

const props = defineProps<{
  cards: BoosterPackCardEntry[];
}>();

const {
  cards,
  dealingStatus,
  endSweep,
  containerRef,
  canvasContainerRef,
  allRevealed
} = provideBoosterPack({
  cards: computed(() => props.cards)
});
</script>

<template>
  <Transition appear>
    <div class="overflow-hidden">
      <div
        class="booster-pack-content"
        :class="dealingStatus"
        ref="containerRef"
        @mouseup="endSweep"
        @mouseleave="endSweep"
      >
        <div ref="canvasContainerRef" class="canvas-overlay"></div>

        <BoosterPackCard
          v-for="(_, index) in cards"
          :key="index"
          :index="index"
        />

        <Transition name="fade">
          <div v-if="dealingStatus === 'waiting'" class="stack-glow"></div>
        </Transition>
        <Transition name="done">
          <div
            v-if="dealingStatus === 'done' && allRevealed"
            class="absolute bottom-7"
          >
            <slot name="done"></slot>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
@keyframes booster-enter {
  from {
    transform: scale(0.5) rotateX(90deg);
    opacity: 0;
    translate: 0 300px;
  }
  50% {
    translate: 0 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.canvas-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 100;
}

.booster-pack-content {
  transform-style: preserve-3d;
  perspective: 1300px;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 800px; /* Ensure enough space */
  max-width: 100vw;
  &.v-enter-active {
    animation: booster-enter 0.8s var(--ease-out-2);
  }
}

@keyframes booster-rarity-shadow {
  from,
  to {
    box-shadow:
      0 0 0px var(--shadow-color),
      0 0 10px hsla(from var(--shadow-color) h s l / 0.6),
      0 0 30px hsla(from var(--shadow-color) h s l / 0.3);
  }
  50% {
    box-shadow:
      0 0 20px var(--shadow-color),
      0 0 40px hsla(from var(--shadow-color) h s l / 0.6),
      0 0 60px hsla(from var(--shadow-color) h s l / 0.3);
  }
}

.done :deep(.booster-card-rare) {
  --shadow-color: var(--rarity-rare);
  animation: booster-rarity-shadow 2s infinite;
}
.done :deep(.booster-card-epic) {
  --shadow-color: var(--rarity-epic);
  animation: booster-rarity-shadow 2s infinite;
}
.done :deep(.booster-card-legendary) {
  --shadow-color: var(--rarity-legendary);
  animation: booster-rarity-shadow 2s infinite;
}

.stack-glow {
  position: absolute;
  width: calc(var(--pixel-scale) * var(--card-width));
  height: calc(var(--pixel-scale) * var(--card-height));
  background: radial-gradient(circle at center, red, transparent 40%);
  z-index: 6;
  filter: blur(30px);
  animation: booster-pulse-glow 4s linear infinite;
  pointer-events: none;
  mix-blend-mode: screen;
  translate: 0 50px;
  scale: 2;
}

@keyframes booster-pulse-glow {
  0% {
    opacity: 0.1;
    transform: scale(0.8);
    filter: hue-rotate(0deg);
  }
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.8);
    filter: hue-rotate(360deg);
    opacity: 0.1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: scale 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  scale: 0;
}

.done-enter-active,
.done-leave-active {
  transition: all 0.3s;
}

.done-enter-from,
.done-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
