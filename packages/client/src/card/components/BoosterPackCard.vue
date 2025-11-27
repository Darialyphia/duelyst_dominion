<script setup lang="ts">
import { computed } from 'vue';
import { CARD_KINDS, RARITIES } from '@game/engine/src/card/card.enums';
import BlueprintCard from './BlueprintCard.vue';
import { useBoosterPack } from '../composables/useBoosterPack';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';

const props = defineProps<{
  index: number;
}>();

const {
  cards,
  isRevealed,
  isShaking,
  startSweep,
  onCardHover,
  reveal,
  wrapperRefs,
  cardStyles,
  boosterId
} = useBoosterPack();

const card = computed(() => cards.value[props.index]);

const particles = computed(() => {
  const isLegendary = card.value.blueprint.rarity === RARITIES.LEGENDARY;
  const particleCount = isLegendary ? 60 : 20;

  return Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x:
      (Math.random() < 0.5 ? -1 : 1) *
      ((isLegendary ? 300 : 200) + Math.random() * 200),
    y:
      (Math.random() < 0.5 ? -1 : 1) *
      ((isLegendary ? 300 : 200) + Math.random() * 200),
    size: Math.random() * (isLegendary ? 8 : 5) + (isLegendary ? 3 : 2),
    delay: Math.random() * (isLegendary ? 1.5 : 0.5),
    speed: isLegendary ? 1.5 : 0.8,
    color: isLegendary ? '#ffd700' : 'white'
  }));
});

const getAnimationSequence = (blueprint: CardBlueprint) => {
  if (
    blueprint.kind === CARD_KINDS.GENERAL ||
    blueprint.kind === CARD_KINDS.MINION
  ) {
    return ['breathing'];
  }
  return ['default'];
};
</script>

<template>
  <div
    :key="`${boosterId}-${index}`"
    class="card-slot"
    :style="cardStyles[index]"
    :class="{ 'is-shaking': isShaking }"
    @click="reveal(index)"
    @mousedown="startSweep(index)"
    @mouseenter="onCardHover(index)"
  >
    <div
      class="card-wrapper"
      :ref="el => (wrapperRefs[index] = el as HTMLElement | null)"
      :class="{
        revealed: isRevealed(index),
        [`rarity-${card.blueprint.rarity.toLowerCase()}`]: true
      }"
    >
      <BlueprintCard
        class="booster-card"
        :class="`booster-card-${card.blueprint.rarity.toLocaleLowerCase()}`"
        :blueprint="card.blueprint"
        :is-tiltable="false"
        :is-foil="isRevealed(index) ? card.isFoil : false"
        :animation-sequence="getAnimationSequence(card.blueprint)"
      />

      <div class="god-rays" />

      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          '--x': `${particle.x}px`,
          '--y': `${particle.y}px`,
          '--size': `${particle.size}px`,
          '--delay': `${particle.delay}s`,
          '--duration': `${particle.speed}s`,
          '--color': `${particle.color}`
        }"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
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
  transition-delay: calc(var(--child-index) * 0.05s);

  &:not(:has(.revealed)) {
    --shake-duration: 3s;
    &.is-shaking {
      --shake-duration: 1.5s;
    }
  }
}

@property --booster-reveal-sheen-start {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@property --booster-reveal-sheen-end {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@keyframes booster-reveal-sheen {
  from {
    --booster-reveal-sheen-start: 0%;
    --booster-reveal-sheen-end: 0%;
    opacity: 1;
  }
  to {
    --booster-reveal-sheen-start: 110%;
    --booster-reveal-sheen-end: 115%;
    opacity: 1;
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
    --space: 5%;
    --angle: 135deg;
    --booster-reveal-sheen-start: 0%;
    --booster-reveal-sheen-end: 0%;
    &::after {
      content: '';
      inset: 0;
      position: absolute;
      opacity: 0;
      background: repeating-linear-gradient(
        135deg,
        rgb(255, 119, 115) calc(var(--space) * 1),
        rgba(255, 237, 95, 1) calc(var(--space) * 2),
        rgba(168, 255, 95, 1) calc(var(--space) * 3),
        rgba(131, 255, 247, 1) calc(var(--space) * 4),
        rgba(120, 148, 255, 1) calc(var(--space) * 5),
        rgb(216, 117, 255) calc(var(--space) * 6),
        rgb(255, 119, 115) calc(var(--space) * 7)
      );
      mask-image: linear-gradient(
        135deg,
        transparent,
        transparent calc(var(--booster-reveal-sheen-start) - 10%),
        black var(--booster-reveal-sheen-start),
        black var(--booster-reveal-sheen-end),
        transparent calc(var(--booster-reveal-sheen-end) + 10%)
      );
      animation: booster-reveal-sheen 1s forwards;
      animation-delay: 0.25s;
      mix-blend-mode: overlay;
    }
  }
}

.booster-card {
  transition: transform 0.6s
    linear(
      0,
      0.259 5.2%,
      0.918 16.5%,
      1.088 21.5%,
      1.166 25.3%,
      1.206 29.2%,
      1.224 33.3%,
      1.227 37.6%,
      1.219 42.1%,
      1.144 54.6%,
      1.103 61.4%,
      1.075 68.4%,
      1.06 75.7%,
      1.055 83.3%,
      1.058 91.3%,
      1.063
    );
  &:deep(.card-inner) {
    backface-visibility: hidden;
  }
}

.god-rays {
  position: absolute;
  width: 100%;
  height: 100%;
  inset: 0;
  background-image: radial-gradient(
    circle closest-side,
    transparent 25%,
    rgba(255, 255, 255, 0.03) 45%,
    rgba(255, 255, 255, 0.08) 65%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 100% 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-wrapper.revealed .god-rays {
  opacity: 1;
}

.rarity-common.revealed,
.rarity-rare.revealed,
.rarity-epic.revealed {
  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    background: conic-gradient(
      from var(--conic-gradient-angle) at 50% 50%,
      var(--color-primary-blue),
      var(--color-primary-yellow),
      var(--color-primary-purple),
      var(--color-primary-blue),
      var(--color-primary-yellow),
      var(--color-primary-purple),
      var(--color-primary-blue)
    );
    border-radius: var(--radius-4);
    animation: booster-border-gradient-rotate 2s linear infinite;
    opacity: 0;
    animation-delay: 0.6s;
  }
  animation: booster-border-reveal 0.2s forwards;
  animation-delay: 0.6s;
}

@keyframes booster-border-reveal {
  from {
    &::before {
      opacity: 0;
    }
  }
  to {
    &::before {
      opacity: 1;
    }
  }
}

.rarity-legendary.revealed {
  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    background: conic-gradient(
      from var(--conic-gradient-angle) at 50% 50%,
      var(--color-primary-blue),
      var(--color-primary-yellow),
      var(--color-primary-purple),
      var(--color-primary-blue),
      var(--color-primary-yellow),
      var(--color-primary-purple),
      var(--color-primary-blue)
    );
    border-radius: var(--radius-4);
    animation: booster-border-gradient-rotate 2s linear infinite;
    opacity: 0;
    animation-delay: 0.6s;
  }
  &::after {
    content: '';
    position: absolute;
    inset: -6px;
    background: conic-gradient(
      from var(--conic-gradient-angle-2) at 50% 50%,
      transparent 0deg,
      var(--color-primary-yellow) 45deg,
      transparent 90deg,
      transparent 180deg,
      var(--color-primary-yellow) 225deg,
      transparent 270deg
    );
    border-radius: var(--radius-4);
    animation: booster-border-gradient-rotate 1s linear infinite;
    opacity: 0;
    filter: blur(10px);
    animation-delay: 0.6s;
  }
  animation: booster-border-reveal 0.2s forwards;
  animation-delay: 0.6s;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background-color: var(--color);
  opacity: 0;
  pointer-events: none;
  filter: blur(1px);
  box-shadow:
    0 0 10px var(--color),
    0 0 20px var(--color);
}

.card-wrapper.revealed .particle {
  animation: particle-float var(--duration) ease-out forwards;
  animation-delay: calc(0.6s + var(--delay));
}

@keyframes particle-float {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0);
  }
  10% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--x), var(--y)) scale(0);
  }
}
</style>
