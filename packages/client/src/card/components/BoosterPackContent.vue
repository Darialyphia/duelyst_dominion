<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import BlueprintCard from './BlueprintCard.vue';

const props = defineProps<{
  cards: Array<{
    blueprint: CardBlueprint;
    isFoil: boolean;
  }>;
}>();

const flippedCards = ref<Set<number>>(new Set());

const isRevealed = (index: number) => flippedCards.value.has(index);

const dealingStatus = ref<'waiting' | 'dealing' | 'done'>('waiting');

const isSweeping = ref(false);

const reveal = (index: number) => {
  if (dealingStatus.value === 'waiting') {
    dealingStatus.value = 'dealing';
    setTimeout(
      () => {
        dealingStatus.value = 'done';
      },
      (props.cards.length + 1) * 200
    );
    return;
  }

  if (dealingStatus.value === 'done' && !flippedCards.value.has(index)) {
    flippedCards.value.add(index);
  }
};

const startSweep = (index: number) => {
  if (dealingStatus.value === 'done') {
    isSweeping.value = true;
    // Reveal the card where the sweep starts
    if (!flippedCards.value.has(index)) {
      flippedCards.value.add(index);
    }
  }
};

const endSweep = () => {
  isSweeping.value = false;
};

const onCardHover = (index: number) => {
  if (
    isSweeping.value &&
    dealingStatus.value === 'done' &&
    !flippedCards.value.has(index)
  ) {
    flippedCards.value.add(index);
  }
};

const cardStyles = computed(() => {
  const count = props.cards.length;
  const radius = 800;
  const angleStep = 15;
  const totalArc = (count - 1) * angleStep;
  const startAngle = -90 - totalArc / 2;

  return props.cards.map((_, index) => {
    const angle = startAngle + index * angleStep;
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius + 600;
    const rotation = angle + 90;

    return {
      transform:
        dealingStatus.value !== 'waiting'
          ? `translate(${x}px, ${y}px) rotate(${rotation}deg)`
          : `translate(0px, 0px) rotate(0deg)`,
      '--z-index': count - index,
      '--child-index': index
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
  <div
    class="booster-pack-content"
    :class="dealingStatus"
    @mouseup="endSweep"
    @mouseleave="endSweep"
  >
    <div
      v-for="(card, index) in cards"
      :key="card.blueprint.id"
      class="card-slot"
      :style="cardStyles[index]"
      @click="reveal(index)"
      @mousedown="startSweep(index)"
      @mouseenter="onCardHover(index)"
    >
      <div class="card-wrapper" :class="{ revealed: isRevealed(index) }">
        <BlueprintCard
          class="booster-card"
          :class="`booster-card-${card.blueprint.rarity.toLocaleLowerCase()}`"
          :blueprint="card.blueprint"
          :is-tiltable="false"
          :is-foil="isRevealed(index) ? card.isFoil : false"
          :animation-sequence="getAnimationSequence(card.blueprint)"
        />
      </div>
    </div>
    <transition name="fade">
      <div v-if="dealingStatus === 'waiting'" class="stack-glow"></div>
    </transition>
  </div>
</template>

<style scoped lang="postcss">
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
}

@property --conic-gradient-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
@property --conic-gradient-angle-2 {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes booster-border-gradient-rotate {
  from {
    --conic-gradient-angle: 0deg;
    --conic-gradient-angle-2: 0deg;
  }
  to {
    --conic-gradient-angle: 360deg;
    --conic-gradient-angle-2: -360deg;
  }
}
.card-slot {
  position: absolute;
  transform-style: preserve-3d;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index);

  transition: transform 0.4s
    linear(
      0,
      0.544 5.5%,
      0.947 11.5%,
      1.213 18.1%,
      1.298 21.7%,
      1.352 25.5%,
      1.372 28.2%,
      1.379 31.1%,
      1.374 34.2%,
      1.357 37.6%,
      1.307 43.7%,
      1.121 61.8%,
      1.074 67.8%,
      1.04 73.7%,
      1.007 84.7%,
      1
    );
  transition-delay: calc(var(--child-index) * 0.2s);
  &:has(.revealed) {
    z-index: calc(10 + var(--z-index));
  }
  &:not(:has(.revealed))::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    filter: blur(4px);
    background:
      conic-gradient(
        from var(--conic-gradient-angle) at center,
        cyan 0deg,
        orange 20deg,
        transparent 20deg
      ),
      conic-gradient(
        from var(--conic-gradient-angle-2) at center,
        magenta 0deg,
        yellow 20deg,
        transparent 20deg
      );
    animation: booster-border-gradient-rotate 2s linear infinite;
  }
}

.card-wrapper {
  --pixel-scale: 1.5;
  width: calc(var(--card-width) * var(--pixel-scale));
  aspect-ratio: var(--card-ratio);
  transform-origin: center center;
  transform-style: preserve-3d;
  &:not(.revealed) .booster-card {
    transform: rotateY(180deg);
  }
  &.revealed {
    animation:
      booster-reveal-bloom 0.6s,
      booster-reveal-zindex 0.6s;
    .booster-card {
      transition: transform 0.6s var(--ease-out-2);
    }
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
.done .booster-card-rare {
  --shadow-color: var(--rarity-rare);
  animation: booster-rarity-shadow 2s infinite;
}
.done .booster-card-epic {
  --shadow-color: var(--rarity-epic);
  animation: booster-rarity-shadow 2s infinite;
}
.done .booster-card-legendary {
  --shadow-color: var(--rarity-legendary);
  animation: booster-rarity-shadow 2s infinite;
}

.stack-glow {
  position: absolute;
  width: var(--card-width);
  height: var(--card-height);
  background: cyan;
  z-index: 6;
  filter: blur(30px);
  animation: booster-pulse-glow 2s infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}

@keyframes booster-card-scale {
  0% {
    scale: 1;
  }
  50% {
    scale: 1.1;
  }
  100% {
    scale: 1;
  }
}

@keyframes booster-reveal-bloom {
  from,
  25% {
    filter: brightness(3) blur(5px);
  }
}

@keyframes booster-pulse-glow {
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
