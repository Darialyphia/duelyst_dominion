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
  <div class="booster-pack-content" :class="dealingStatus">
    <div
      v-for="(card, index) in cards"
      :key="card.blueprint.id"
      class="card-slot"
      :style="cardStyles[index]"
      @click="reveal(index)"
    >
      <div class="card-wrapper" :class="{ revealed: isRevealed(index) }">
        <BlueprintCard
          class="booster-card"
          :class="`booster-card-${card.blueprint.rarity.toLocaleLowerCase()}`"
          :blueprint="card.blueprint"
          :is-tiltable="false"
          :is-foil="card.isFoil"
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
  &:hover:has(.revealed) {
    z-index: 10;
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
    animation: booster-reveal-bloom 0.6s;
    .booster-card {
      transition: transform 0.6s var(--ease-out-2);
      animation: booster-card-scale 0.6s;
    }
  }
}

.done .booster-card-rare {
  box-shadow:
    0 0 15px var(--rarity-rare),
    0 0 25px hsla(from var(--rarity-rare) h s l / 0.6),
    0 0 50px hsla(from var(--rarity-rare) h s l / 0.3);
  transition: box-shadow 0.5s;
}
.done .booster-card-epic {
  box-shadow:
    0 0 15px var(--rarity-epic),
    0 0 25px hsla(from var(--rarity-epic) h s l / 0.6),
    0 0 50px hsla(from var(--rarity-epic) h s l / 0.3);
  transition: box-shadow 0.5s;
}
.done .booster-card-legendary {
  box-shadow:
    0 0 15px var(--rarity-legendary),
    0 0 25px hsla(from var(--rarity-legendary) h s l / 0.6),
    0 0 50px hsla(from var(--rarity-legendary) h s l / 0.3);
  transition: box-shadow 0.5s;
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
