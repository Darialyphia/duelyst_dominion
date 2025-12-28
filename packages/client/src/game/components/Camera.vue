<script setup lang="ts">
import {
  useFxEvent,
  useGameState,
  useGameUi,
  useUnits
} from '../composables/useGameClient';
import { config } from '@/utils/config';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { Point } from '@game/shared';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
// import { useMouse, useWindowSize } from '@vueuse/core';

const state = useGameState();
const ui = useGameUi();
const units = useUnits();
// const { x, y } = useMouse();
// const { width, height } = useWindowSize();

const camera = ref({
  origin: { x: 0, y: 0 },
  scale: 1,
  angle: { x: 20, y: 0, z: 0 }
});

const zoomIn = (origin: Point, duration: number) => {
  camera.value.origin = {
    x: origin.x + config.CELL.width * 3,
    y: origin.y
  };
  const proxy = {
    scale: camera.value.scale,
    angleX: camera.value.angle.x,
    angleY: camera.value.angle.y,
    angleZ: camera.value.angle.z
  };

  gsap.to(proxy, {
    duration,
    ease: Power2.easeOut,
    scale: 2,
    angleX: 45,
    angleZ: 0,
    onUpdate: () => {
      camera.value.scale = proxy.scale;
      camera.value.angle.x = proxy.angleX;
      camera.value.angle.y = proxy.angleY;
      camera.value.angle.z = proxy.angleZ;
    }
  });
};

const zoomOut = async (duration: number) => {
  const proxy = {
    scale: camera.value.scale,
    angleX: camera.value.angle.x,
    angleY: camera.value.angle.y,
    angleZ: camera.value.angle.z
  };
  await gsap.to(proxy, {
    duration,
    ease: Power2.easeOut,
    scale: 1,
    angleX: 20,
    angleY: 0,
    onUpdate: () => {
      camera.value.scale = proxy.scale;
      camera.value.angle.x = proxy.angleX;
      camera.value.angle.y = proxy.angleY;
      camera.value.angle.z = proxy.angleZ;
    }
  });
  camera.value.angle.z = 0;
  camera.value.origin = { x: 0, y: 0 };
};
useFxEvent(FX_EVENTS.PRE_UNIT_BEFORE_ATTACK, async event => {
  const unit = units.value.find(u => u.id === event.unit)!;
  const origin = config.CELL.toScreenPosition(unit);
  return zoomIn(origin, 0.4);
});

useFxEvent(FX_EVENTS.UNIT_BEFORE_COUNTERATTACK, event => {
  const unit = units.value.find(u => u.id === event.unit)!;
  const origin = config.CELL.toScreenPosition(unit);
  return zoomIn(origin, 0.3);
});

useFxEvent(FX_EVENTS.UNIT_AFTER_COMBAT, async () => zoomOut(0.6));

watch(
  () => state.value.interaction.state,
  async newState => {
    if (newState !== INTERACTION_STATES.IDLE) {
      await zoomOut(0.6);
    }
  }
);

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
        '--board-angle-Y': `${camera.angle.y}deg`,
        '--board-angle-Z': `${camera.angle.z}deg`
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
  transform: rotateY(var(--board-angle-Y)) rotateX(var(--board-angle-X))
    rotateZ(var(--board-angle-Z));
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
  background: url(@/assets/backgrounds/booster-opening.png) center/cover
    no-repeat;
  translate: -9.9% -10%;
}
</style>
