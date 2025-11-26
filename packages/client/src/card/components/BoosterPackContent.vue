<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import { ShockwaveFilter } from '@pixi/filter-shockwave';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARD_KINDS, RARITIES } from '@game/engine/src/card/card.enums';
import BlueprintCard from './BlueprintCard.vue';

const props = defineProps<{
  cards: Array<{
    blueprint: CardBlueprint;
    isFoil: boolean;
  }>;
}>();

const flippedCards = ref<Set<number>>(new Set());
const wrapperRefs = ref<HTMLElement[]>([]);
const containerRef = ref<HTMLElement | null>(null);
const canvasContainerRef = ref<HTMLElement | null>(null);
let pixiApp: PIXI.Application | null = null;

const initPixi = () => {
  if (!canvasContainerRef.value) return;

  pixiApp = new PIXI.Application({
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true
  });

  canvasContainerRef.value.appendChild(pixiApp.view as unknown as Node);
};

onMounted(() => {
  initPixi();
});

onBeforeUnmount(() => {
  if (pixiApp) {
    pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
  }
});

const createParticleTexture = () => {
  const gfx = new PIXI.Graphics();
  gfx.beginFill(0xffffff);
  gfx.drawCircle(0, 0, 10);
  gfx.endFill();
  return pixiApp?.renderer.generateTexture(gfx);
};

const triggerPixiExplosion = (x: number, y: number) => {
  if (!pixiApp) return;

  const container = new PIXI.Container();
  pixiApp.stage.addChild(container);

  // Shockwave
  const shockwave = new ShockwaveFilter(
    [x, y],
    {
      amplitude: 30,
      wavelength: 160,
      speed: 500,
      radius: -1
    },
    0
  );
  // We need something to apply the filter to.
  // Since we can't easily distort the DOM, let's create a displacement ring visual
  // or just apply it to the particles container (which won't do much if particles are small).
  // Instead, let's make a "Ring" graphic that expands.

  const ring = new PIXI.Graphics();
  ring.lineStyle(5, 0xffd700, 1);
  ring.drawCircle(0, 0, 100);
  ring.position.set(x, y);
  ring.scale.set(0);
  ring.filters = [shockwave];
  container.addChild(ring);

  gsap.to(ring.scale, { x: 5, y: 5, duration: 1, ease: 'power2.out' });
  gsap.to(ring, { alpha: 0, duration: 1, ease: 'power2.out' });

  // Particles
  const texture = createParticleTexture();
  if (!texture) return;

  const particleCount = 200;
  for (let i = 0; i < particleCount; i++) {
    const sprite = new PIXI.Sprite(texture);
    sprite.x = x;
    sprite.y = y;
    sprite.anchor.set(0.5);
    sprite.tint = Math.random() < 0.5 ? 0xffd700 : 0xff4500; // Gold or Orange
    sprite.scale.set(Math.random() * 0.5 + 0.2);

    const angle = Math.random() * Math.PI * 2;

    container.addChild(sprite);

    gsap.to(sprite, {
      x: x + Math.cos(angle) * (300 + Math.random() * 200),
      y: y + Math.sin(angle) * (300 + Math.random() * 200),
      alpha: 0,
      duration: 1 + Math.random(),
      ease: 'power2.out'
    });
  }

  // Cleanup container
  setTimeout(() => {
    container.destroy({ children: true });
  }, 2000);
};

const isRevealed = (index: number) => flippedCards.value.has(index);

const dealingStatus = ref<'waiting' | 'dealing' | 'done'>('waiting');

const isSweeping = ref(false);

const shakeTween = ref<gsap.core.Tween | null>(null);
const shakeStartTime = ref(0);
const isShaking = ref(false);
const MIN_SHAKE_TIME = 1500;
const isDealScheduled = ref(false);

const startShaking = () => {
  if (isDealScheduled.value) return;
  shakeStartTime.value = Date.now();
  let shakeCounter = 0;
  const shake = () => {
    shakeCounter += 0.5;
    shakeTween.value = gsap.to(wrapperRefs.value, {
      x: `random(-${5 + shakeCounter}, ${5 + shakeCounter})`,
      y: `random(-${5 + shakeCounter}, ${5 + shakeCounter})`,
      duration: 0.05,
      onComplete: shake
    });
  };

  if (shakeTween.value) shakeTween.value.kill();
  isShaking.value = true;
  shake();
};

const stopShakingAndDeal = () => {
  if (isDealScheduled.value || !shakeTween.value) return;
  isShaking.value = false;
  isDealScheduled.value = true;

  const elapsed = Date.now() - shakeStartTime.value;
  const remaining = Math.max(0, MIN_SHAKE_TIME - elapsed);

  setTimeout(() => {
    if (shakeTween.value) {
      shakeTween.value.kill();
      shakeTween.value = null;
    }

    dealingStatus.value = 'dealing';
    setTimeout(
      () => {
        dealingStatus.value = 'done';
        isDealScheduled.value = false;
      },
      (props.cards.length + 1) * 50
    );
    gsap.to(wrapperRefs.value, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.05,
      clearProps: 'all',
      onComplete: () => {}
    });
  }, remaining);
};

const reveal = (index: number) => {
  if (dealingStatus.value === 'done' && !flippedCards.value.has(index)) {
    flippedCards.value.add(index);
    if (props.cards[index].blueprint.rarity === RARITIES.LEGENDARY) {
      triggerLegendaryShake();

      // Get card position for explosion
      const cardEl = wrapperRefs.value[index];
      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        triggerPixiExplosion(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
      }
    }
  }
};

const triggerLegendaryShake = () => {
  if (!containerRef.value) return;
  gsap.fromTo(
    containerRef.value,
    { x: 0, y: 0 },
    {
      x: () => (Math.random() - 0.5) * 30,
      y: () => (Math.random() - 0.5) * 30,
      duration: 0.05,
      repeat: 10,
      yoyo: true,
      clearProps: 'x,y',
      ease: 'power1.inOut',
      onComplete: () => {
        console.log('Legendary shake complete');
      }
    }
  );
};

const startSweep = (index: number) => {
  if (dealingStatus.value === 'waiting') {
    startShaking();
  } else if (dealingStatus.value === 'done') {
    isSweeping.value = true;
    // Reveal the card where the sweep starts
    if (!flippedCards.value.has(index)) {
      reveal(index);
    }
  }
};

const endSweep = () => {
  if (dealingStatus.value === 'waiting') {
    stopShakingAndDeal();
  }
  isSweeping.value = false;
};

const onCardHover = (index: number) => {
  if (
    isSweeping.value &&
    dealingStatus.value === 'done' &&
    !flippedCards.value.has(index)
  ) {
    reveal(index);
  }
};

const cardStyles = computed(() => {
  const count = props.cards.length;
  const radius = 1000;
  const angleStep = 18;
  const totalArc = (count - 1) * angleStep;
  const startAngle = -90 - totalArc / 2;

  return props.cards.map((_, index) => {
    const angle = startAngle + index * angleStep;
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius + 800;
    const rotation = angle + 90;

    return {
      transform:
        dealingStatus.value !== 'waiting'
          ? `translate(${x}px, ${y}px) rotate(${rotation}deg)`
          : `translate(0px, 80px rotate(0deg)`,
      '--z-index': count - index
    };
  });
});

const getAnimationSequence = (card: CardBlueprint) => {
  if (card.kind === CARD_KINDS.GENERAL || card.kind === CARD_KINDS.MINION) {
    return ['breathing'];
  }
  return ['default'];
};

const allRevealed = computed(() => {
  return flippedCards.value.size === props.cards.length;
});

watch(
  () => props.cards,
  () => {
    // Reset state when cards change
    flippedCards.value.clear();
    dealingStatus.value = 'waiting';
    isSweeping.value = false;
    isShaking.value = false;
    isDealScheduled.value = false;
  }
);

const boosterId = ref(0);
watch(
  () => props.cards,
  () => {
    boosterId.value += 1;
  }
);

const cardsWithParticles = computed(() => {
  return props.cards.map(card => {
    const isLegendary = card.blueprint.rarity === RARITIES.LEGENDARY;
    const particleCount = isLegendary ? 60 : 20;

    return {
      ...card,
      particles: Array.from({ length: particleCount }, (_, i) => ({
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
      }))
    };
  });
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
        <div
          v-for="(card, index) in cardsWithParticles"
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
            ref="wrapperRefs"
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
              v-for="particle in card.particles"
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
    animation-delay: 0.6s;
    .booster-card {
      transition: transform 0.4s var(--ease-out-2);
    }
  }
  &:not(.revealed)::after {
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
    animation: booster-border-gradient-rotate var(--shake-duration) linear
      infinite;
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

.particle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--size);
  height: var(--size);
  background: var(--color);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  box-shadow: 0 0 5px var(--color);
  z-index: 10;
}

.revealed .particle {
  animation: particle-explode 0.8s ease-out forwards;
  animation-delay: calc(0.2s + var(--delay));
  animation-duration: var(--duration, 0.8s);
}

.rarity-legendary .particle {
  box-shadow:
    0 0 10px var(--color),
    0 0 20px #ff8c00,
    0 0 40px #ff4500;
  mix-blend-mode: screen;
}

.god-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  background: repeating-conic-gradient(
    from 0deg,
    rgba(255, 215, 0, 0) 0deg,
    rgba(255, 215, 0, 0.15) 10deg,
    hsla(from var(--rarity-legendary) h s l / 0.75) 20deg,
    rgba(255, 215, 0, 0.15) 30deg,
    rgba(255, 215, 0, 0) 40deg
  );
  z-index: -1;
  opacity: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  mask-image: radial-gradient(
    circle at center,
    black 0%,
    black 35%,
    transparent 70%
  );
}

.revealed.rarity-legendary .god-rays {
  animation:
    god-rays-rotate 20s linear infinite,
    god-rays-appear 1s ease-out forwards;
  animation-delay: 0s, 0.2s;
}

@keyframes god-rays-rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes god-rays-appear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes particle-explode {
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(0);
    opacity: 0;
  }
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

@keyframes booster-reveal-bloom {
  25% {
    filter: brightness(4) saturate(0.65);
  }
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
