<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import BlueprintCard from './BlueprintCard.vue';

const props = defineProps<{
  cards: CardBlueprint[];
}>();

const flippedCards = ref<Set<number>>(new Set());

const isRevealed = (index: number) => flippedCards.value.has(index);

const dealtCount = ref(0);
const hasStartedDealing = ref(false);

const reveal = (index: number) => {
  if (!hasStartedDealing.value) {
    hasStartedDealing.value = true;
    const deal = () => {
      if (dealtCount.value < props.cards.length) {
        dealtCount.value++;
      } else {
        clearInterval(interval);
      }
    };
    deal();
    const interval = setInterval(deal, 100);
    return;
  }

  if (!flippedCards.value.has(index)) {
    flippedCards.value.add(index);
  }
};

const cardStyles = computed(() => {
  const count = props.cards.length;
  const radius = 250; // Adjust as needed
  const startAngle = -90; // Start from top

  return props.cards.map((_, index) => {
    const isDealt = index < dealtCount.value;
    const angle = startAngle + (index * 360) / count;
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return {
      transform: isDealt ? `translate(${x}px, ${y}px)` : `translate(0px, 0px)`,
      zIndex: count - index
    };
  });
});

const getAnimationSequence = (card: CardBlueprint) => {
  if (card.kind === CARD_KINDS.GENERAL || card.kind === CARD_KINDS.MINION) {
    return ['breathing'];
  }
  return ['default'];
};
</script>

<template>
  <div class="booster-pack-content">
    <div
      v-for="(card, index) in cards"
      :key="card.id"
      class="card-slot"
      :style="cardStyles[index]"
      @click="reveal(index)"
    >
      <div class="card-flipper" :class="{ flipped: isRevealed(index) }">
        <div class="card-wrapper">
          <BlueprintCard
            :blueprint="card"
            :is-tiltable="isRevealed(index)"
            :animation-sequence="getAnimationSequence(card)"
          />
        </div>
      </div>
    </div>
    <transition name="fade">
      <div v-if="!hasStartedDealing" class="stack-glow"></div>
    </transition>
  </div>
</template>

<style scoped>
.booster-pack-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 800px; /* Ensure enough space */
}

.card-slot {
  position: absolute;
  cursor: pointer;
  /* Center the card in the slot */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.card-flipper {
  position: relative;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  transform: rotateY(180deg); /* Start face down */
}

.card-flipper.flipped {
  transform: rotateY(0deg); /* Flip to face up */
}

.card-wrapper {
  /* Ensure the card component's 3D context is preserved */
  transform-style: preserve-3d;
  --pixel-scale: 1;
}

.stack-glow {
  position: absolute;
  width: var(--card-width);
  height: var(--card-height);
  background: cyan;
  z-index: 6;
  filter: blur(30px);
  animation: pulse-glow 2s infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}

@keyframes pulse-glow {
  0% {
    transform: scale(0.95);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.95);
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
</style>
