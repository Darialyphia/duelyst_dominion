<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useDissolveVFX } from '../composables/useDissolve';
import { useFxEvent } from '../composables/useGameClient';
import { waitFor } from '@game/shared';

const {
  unitId,
  bgPosition,
  imageBg,
  spriteWidth,
  spriteHeight,
  sheetWidth,
  sheetHeight,
  isFoil,
  isTeleporting,
  isTriggeringEffect
} = defineProps<{
  unitId: string;
  bgPosition: string;
  imageBg: string;
  spriteWidth: number;
  spriteHeight: number;
  sheetWidth: number;
  sheetHeight: number;
  isFlipped: boolean;
  isFoil: boolean;
  isTeleporting: boolean;
  isTriggeringEffect: boolean;
}>();

const dissolve = useDissolveVFX();
const rootEl = useTemplateRef('root');
useFxEvent(FX_EVENTS.UNIT_AFTER_DESTROY, async event => {
  if (event.unit !== unitId) return;
  const duration = 1000;
  dissolve.play(rootEl.value as HTMLElement, duration);
  await waitFor(duration);
});
</script>

<template>
  <div
    ref="root"
    class="sprite-wrapper"
    :class="{
      'is-teleporting': isTeleporting,
      'is-triggering-effect': isTriggeringEffect
    }"
    :style="{
      '--parallax-factor': 0.5,
      '--bg-position': bgPosition,
      '--width': `${spriteWidth}px`,
      '--height': `${spriteHeight}px`,
      '--background-width': `calc( ${sheetWidth}px * var(--pixel-scale))`,
      '--background-height': `calc(${sheetHeight}px * var(--pixel-scale))`
    }"
  >
    <div class="sprite">
      <div class="foil" v-if="isFoil" />
      <div class="foil-glare" v-if="isFoil" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.sprite-wrapper {
  --pixel-scale: 1;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  position: absolute;
  bottom: 0;
  left: 50%;
  translate: -50% 0;
  scale: 2;
  transform-origin: bottom center;
  transition: filter 1s var(--ease-2);
  &.is-teleporting {
    filter: url(#chromatic-aberration) brightness(2.5);
  }

  @starting-style {
    filter: brightness(0);
  }
}

.sprite {
  width: 100%;
  height: 100%;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  pointer-events: none;
  position: absolute;
  transform: translateY(10px);
}

@property --unit-foil-center-x {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
@property --unit-foil-center-y {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
@property --unit-foil-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes unit-foil-rotate {
  from {
    --unit-foil-angle: 0deg;
  }
  to {
    --unit-foil-angle: 360deg;
  }
}
@keyframes unit-foil-move {
  from,
  to {
    --unit-foil-center-x: 50%;
    --unit-foil-center-y: 25%;
  }
  50% {
    --unit-foil-center-x: 50%;
    --unit-foil-center-y: 75%;
  }
}

@keyframes unit-foil-brightness {
  from {
    --unit-foil-brightness: 0.2;
  }
  50% {
    --unit-foil-brightness: 0.5;
  }
  to {
    --unit-foil-brightness: 0.2;
  }
}

.foil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mask-image: v-bind(imageBg);
  mask-position: var(--bg-position);
  mask-repeat: no-repeat;
  mask-size: var(--background-width) var(--background-height);
  transform-origin: center center;
  background: conic-gradient(
    from var(--unit-foil-angle) at var(--unit-foil-center-x)
      var(--unit-foil-center-y),
    #ff7 0deg,
    #a8ff5f 60deg,
    #83fff7 120deg,
    #7894ff 180deg,
    #d875ff 240deg,
    #ff7773 300deg,
    #ff7 360deg
  );
  mix-blend-mode: darken;
  animation:
    unit-foil-rotate 8s linear infinite,
    unit-foil-move 5s ease-in-out infinite,
    unit-foil-brightness 10s ease-in-out infinite;
  opacity: 0.4;
  filter: brightness(calc((var(--unit-foil-brightness) * 0.3) + 0.5))
    contrast(5) saturate(1.5) blur(5px);
}

.foil-glare {
  position: absolute;
  pointer-events: none;
  inset: 0;
  opacity: 0.3;
  transition: opacity 0.3s;
  --glare-x: 50%;
  --glare-y: 50%;
  background-image: radial-gradient(
    farthest-corner circle at var(--glare-x) var(--glare-y),
    hsla(0, 0%, 100%, 0.8) 10%,
    hsla(0, 70%, 100%, 0.65) 20%,
    hsla(0, 0%, 0%, 0.5) 90%
  );
  mix-blend-mode: overlay;
  mask-image: v-bind(imageBg);
  mask-position: var(--bg-position);
  mask-repeat: no-repeat;
  mask-size: var(--background-width) var(--background-height);
}

@keyframes ability-glow {
  0%,
  100% {
    filter: none;
  }
  50% {
    filter: brightness(3);
  }
}
.is-triggering-effect {
  animation: ability-glow 1s ease-in-out;
}
</style>
