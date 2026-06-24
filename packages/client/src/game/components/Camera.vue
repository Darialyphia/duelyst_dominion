<script setup lang="ts">
import {
  useGameState,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import { config } from '@/utils/config';
// import type { Point } from '@game/shared';
// import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
// import { useMouse, useWindowSize } from '@vueuse/core';

const state = useGameState();
const ui = useGameUi();
// const units = useUnits();
// const { x, y } = useMouse();
// const { width, height } = useWindowSize();

const DEFAULT_ANGLE = { x: 40, y: -0, z: 0 };
const camera = ref({
  origin: { x: 0, y: 0 },
  scale: 1,
  angle: { x: DEFAULT_ANGLE.x, y: DEFAULT_ANGLE.y, z: DEFAULT_ANGLE.z },
  offset: { x: 0, y: -7 }
});

// const zoomIn = async (origin: Point, duration: number) => {
//   const proxy = {
//     scale: camera.value.scale,
//     angleX: camera.value.angle.x,
//     angleY: camera.value.angle.y,
//     angleZ: camera.value.angle.z,
//     originX: camera.value.origin.x,
//     originY: camera.value.origin.y
//   };

//   await gsap.to(proxy, {
//     duration: duration / 2,
//     ease: Power2.easeOut,
//     originX: origin.x + config.CELL.width * 3,
//     originY: origin.y,
//     onUpdate: () => {
//       camera.value.origin.x = proxy.originX;
//       camera.value.origin.y = proxy.originY;
//     }
//   });

//   await gsap.to(proxy, {
//     duration,
//     ease: Power2.easeOut,
//     scale: 1.5,
//     angleX: DEFAULT_ANGLE.x,
//     angleY: DEFAULT_ANGLE.y,
//     angleZ: DEFAULT_ANGLE.z,
//     onUpdate: () => {
//       camera.value.scale = proxy.scale;
//       camera.value.angle.x = proxy.angleX;
//       camera.value.angle.y = proxy.angleY;
//       camera.value.angle.z = proxy.angleZ;
//     }
//   });
// };

// const zoomOut = async (duration: number) => {
//   const proxy = {
//     scale: camera.value.scale,
//     angleX: camera.value.angle.x,
//     angleY: camera.value.angle.y,
//     angleZ: camera.value.angle.z
//   };
//   await gsap.to(proxy, {
//     duration,
//     ease: Power2.easeOut,
//     scale: 1,
//     angleX: DEFAULT_ANGLE.x,
//     angleY: DEFAULT_ANGLE.y,
//     angleZ: DEFAULT_ANGLE.z,
//     onUpdate: () => {
//       camera.value.scale = proxy.scale;
//       camera.value.angle.x = proxy.angleX;
//       camera.value.angle.y = proxy.angleY;
//       camera.value.angle.z = proxy.angleZ;
//     },
//     onComplete: () => {
//       camera.value.origin = { x: 0, y: 0 };
//     }
//   });
// };
// const ORIGIN_OFFSET = {
//   x: 30,
//   y: 50
// };
// useFxEvent(FX_EVENTS.PRE_UNIT_BEFORE_ATTACK, async event => {
//   const unit = units.value.find(u => u.id === event.unit)!;
//   const origin = config.CELL.toScreenPosition(unit);
//   return zoomIn(
//     { x: origin.x + ORIGIN_OFFSET.x * unit.x, y: origin.y + ORIGIN_OFFSET.y },
//     0.4
//   );
// });

// useFxEvent(FX_EVENTS.UNIT_BEFORE_COUNTERATTACK, event => {
//   const unit = units.value.find(u => u.id === event.unit)!;
//   const origin = config.CELL.toScreenPosition(unit);
//   return zoomIn(
//     {
//       x: origin.x + ORIGIN_OFFSET.x * unit.x,
//       y: origin.y + ORIGIN_OFFSET.y
//     },
//     0.3
//   );
// });

// useFxEvent(FX_EVENTS.UNIT_AFTER_COMBAT, async () => zoomOut(0.6));

// watch(
//   () => state.value.interaction.state,
//   async newState => {
//     if (newState !== INTERACTION_STATES.IDLE) {
//       await zoomOut(0.6);
//     }
//   }
// );

const boardStyle = computed(() => ({
  width: `${state.value.board.columns * config.CELL.width}px`,
  height: `${state.value.board.rows * config.CELL.height}px`

  // '--board-angle-X': `${(y.value / height.value - 0.5) * -180}deg`,
  // '--board-angle-Y': `${(x.value / width.value - 0.5) * 180}deg`
}));

const myPlayer = useMyPlayer();
</script>

<template>
  <div
    :id="ui.DOMSelectors.viewport.id"
    class="camera-zoom"
    :style="{
      transform: `scale(${camera.scale})`,
      transformOrigin: `${camera.origin.x}px ${camera.origin.y}px`
    }"
  >
    <div
      class="camera-rotate"
      :class="{ 'is-flipped': !myPlayer.isPlayer1 }"
      :style="{
        '--board-angle-X': `${camera.angle.x}deg`,
        '--board-angle-Y': `${camera.angle.y}deg`,
        '--board-angle-Z': `${camera.angle.z}deg`
      }"
    >
      <!-- <div class="bg" /> -->
      <div
        class="camera-viewport"
        :id="ui.DOMSelectors.board.id"
        :style="boardStyle"
      >
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
  background-repeat: no-repeat;
  background-size: cover, cover, 450px;
  background-position:
    center center,
    center center,
    top left;
  height: 100%;
  width: 100%;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    top: -4%;
    left: -4%;
    width: 108%;
    height: 108%;

    pointer-events: none;
    background-repeat: no-repeat;
    background-size: cover, cover, 450px;
    background-position:
      center center,
      center center,
      top left;
    transform: translateZ(-120px);
  }
}

.camera-rotate {
  width: 100vw;
  height: 100dvh;
  position: absolute;
  pointer-events: auto;
  --base-rotate-z: 0deg;
  transform: translateZ(200px) scale(0.87) rotateY(var(--board-angle-Y))
    rotateX(var(--board-angle-X))
    rotateZ(calc(var(--board-angle-Z) + var(--base-rotate-z)));
  transform-style: preserve-3d;

  &.is-flipped {
    --base-rotate-z: 180deg;
  }
}

.camera-viewport {
  position: absolute;
  pointer-events: auto;
  top: 22%;
  left: 50%;
  translate: calc(-50% + v-bind('camera.offset.x') * 1%)
    calc(v-bind('camera.offset.y') * 1%);
  transform-style: preserve-3d;
  transition: translate 1s var(--ease-4);
  /* solves some hover detection issues because of 3D transforms */
  transform: translateZ(0px);
}
</style>
