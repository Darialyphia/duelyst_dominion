<script setup lang="ts">
import {
  useFxEvent,
  useGameState,
  useGameUi,
  useUnits
} from '../composables/useGameClient';
import { config } from '@/utils/config';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useGlobalSounds } from '../composables/useGlobalSounds';
// import { useMouse, useWindowSize } from '@vueuse/core';

const state = useGameState();
const ui = useGameUi();
const units = useUnits();
useGlobalSounds();
// const { x, y } = useMouse();
// const { width, height } = useWindowSize();

const camera = ref({
  origin: { x: 0, y: 0 },
  scale: 1,
  angle: { x: 20, y: 0 }
});

useFxEvent(FX_EVENTS.PRE_UNIT_BEFORE_ATTACK, async event => {
  const unit = units.value.find(u => u.id === event.unit)!;
  const unitEl = ui.value.DOMSelectors.unit(unit.id).element;
  if (!unitEl) return;
  const rect = unitEl.getBoundingClientRect();
  const origin = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
  camera.value.origin = {
    x: origin.x + config.CELL.width / 2,
    y: origin.y + config.CELL.height / 2 - 150
  };

  const proxy = {
    scale: camera.value.scale,
    angleX: camera.value.angle.x,
    angleY: camera.value.angle.y
  };

  gsap.to(proxy, {
    duration: 0.4,
    ease: Power2.easeOut,
    scale: 2,
    angleX: 45,
    onUpdate: () => {
      camera.value.scale = proxy.scale;
      camera.value.angle.x = proxy.angleX;
      camera.value.angle.y = proxy.angleY;
    }
  });
});

useFxEvent(FX_EVENTS.UNIT_BEFORE_COUNTERATTACK, event => {
  const unit = units.value.find(u => u.id === event.unit)!;
  const unitEl = ui.value.DOMSelectors.unit(unit.id).element;
  if (!unitEl) return;
  const rect = unitEl.getBoundingClientRect();
  const origin = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };

  gsap.to(camera.value.origin, {
    duration: 0.3,
    ease: Power2.easeOut,
    x: origin.x + config.CELL.width / 2,
    y: origin.y + config.CELL.height / 2
  });
});

useFxEvent(FX_EVENTS.UNIT_AFTER_COMBAT, async () => {
  const proxy = {
    scale: camera.value.scale,
    angleX: camera.value.angle.x,
    angleY: camera.value.angle.y
  };
  await gsap.to(proxy, {
    duration: 0.6,
    ease: Power2.easeOut,
    scale: 1,
    angleX: 20,
    angleY: 0,
    onUpdate: () => {
      camera.value.scale = proxy.scale;
      camera.value.angle.x = proxy.angleX;
      camera.value.angle.y = proxy.angleY;
    }
  });

  camera.value.origin = { x: 0, y: 0 };
});

const boardStyle = computed(() => ({
  width: `${state.value.board.columns * config.CELL.width}px`,
  height: `${state.value.board.rows * config.CELL.height}px`

  // '--board-angle-X': `${(y.value / height.value - 0.5) * -180}deg`,
  // '--board-angle-Y': `${(x.value / width.value - 0.5) * 180}deg`
}));
</script>

<template>
  <div
    class="camera-zoom"
    :style="{
      transform: ` scale(${camera.scale})`,
      transformOrigin: `${camera.origin.x}px ${camera.origin.y}px`
    }"
  >
    <div
      class="camera-rotate"
      :style="{
        '--board-angle-X': `${camera.angle.x}deg`,
        '--board-angle-Y': `${camera.angle.y}deg `
      }"
    >
      <div class="bg" />
      <div class="board" :id="ui.DOMSelectors.board.id" :style="boardStyle">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.camera-zoom {
  position: absolute;
  pointer-events: none;
  transform-style: preserve-3d;
}

.camera-rotate {
  width: 100vw;
  height: 100dvh;
  position: absolute;
  pointer-events: auto;
  transform: rotateY(var(--board-angle-Y)) rotateX(var(--board-angle-X));
  transform-style: preserve-3d;
}

.board {
  position: absolute;
  top: 40%;
  left: 50%;
  translate: -50% -50%;
  transform-style: preserve-3d;
}

.bg {
  position: absolute;
  width: 125vw;
  height: 125dvh;
  background: url(/assets/backgrounds/booster-opening.png) center/cover
    no-repeat;
  translate: -9.9% -10%;
}
</style>
