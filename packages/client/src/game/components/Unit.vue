<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import HexPositioner from './HexPositioner.vue';
import {
  useFxEvent,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import gsap from 'gsap';
import { config } from '@/utils/config';
import type { Point } from '@game/shared';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useGameUi();
const myPlayer = useMyPlayer();
const isAlly = computed(() => unit.getPlayer()?.equals(myPlayer.value));
const unitBg = computed(() => {
  return `url(${unit.getCard().imagePath})`;
});

const hexOffset = ref({
  x: 0,
  y: 0
});

useFxEvent(FX_EVENTS.UNIT_AFTER_MOVE, async event => {
  if (event.unit !== unit.id) return;
  const { path, previousPosition } = event;

  const stepDuration = 0.4;
  const hopHeight = 30;

  const timeline = gsap.timeline();

  path.forEach((point, index) => {
    const prev = index === 0 ? previousPosition : path[index - 1];
    const prevScaled = config.HEXES.toScreenPosition(prev);
    const destinationScaled = config.HEXES.toScreenPosition(point);
    const deltaX = destinationScaled.x - prevScaled.x;
    const deltaY = destinationScaled.y - prevScaled.y;

    // First half: move forward and up
    timeline.to(hexOffset.value, {
      x: `+=${deltaX}`,
      y: `+=${deltaY - hopHeight}`,
      duration: stepDuration / 2,
      ease: 'power1.out'
    });

    // Second half: come back down
    timeline.to(hexOffset.value, {
      y: `+=${hopHeight}`,
      duration: stepDuration / 2,
      ease: 'power1.in'
    });
  });

  timeline.set(hexOffset.value, { x: 0, y: 0 });

  await timeline.play();
});

const isAttacking = ref(false);
const onAttack = async (event: { unit: string; target: Point }) => {
  if (event.unit !== unit.id) return;

  const timeline = gsap.timeline();

  const position = config.HEXES.toScreenPosition(unit.position);
  const targetPosition = config.HEXES.toScreenPosition(event.target);
  const delta = {
    x: targetPosition.x - position.x,
    y: targetPosition.y - position.y
  };
  isAttacking.value = true;
  // anticipation
  timeline.to(hexOffset.value, {
    x: `-=${delta.x / 4}`,
    y: `-=${delta.y / 4 - 15}`,
    duration: 0.15,
    ease: Power1.easeIn
  });

  // attack
  timeline.to(hexOffset.value, {
    x: delta.x * 0.75,
    y: delta.y * 0.75,
    duration: 0.1
  });

  // recover
  timeline.to(hexOffset.value, {
    x: 0,
    y: 0,
    duration: 0.2,
    ease: Power1.easeOut,
    onComplete: () => {
      isAttacking.value = false;
    }
  });

  await timeline.play();
};
useFxEvent(FX_EVENTS.UNIT_BEFORE_ATTACK, onAttack);
useFxEvent(FX_EVENTS.UNIT_BEFORE_COUNTERATTACK, onAttack);

useFxEvent(FX_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE, async event => {
  if (event.unit !== unit.id) return;

  const timeline = gsap.timeline();
  const shakeIntensity = 10;

  // Shake left and right multiple times
  timeline.to(hexOffset.value, {
    x: shakeIntensity,
    duration: 0.05,
    ease: 'power1.inOut'
  });

  timeline.to(hexOffset.value, {
    x: -shakeIntensity,
    duration: 0.05,
    ease: 'power1.inOut'
  });

  timeline.to(hexOffset.value, {
    x: shakeIntensity / 2,
    duration: 0.05,
    ease: 'power1.inOut'
  });

  timeline.to(hexOffset.value, {
    x: -shakeIntensity / 2,
    duration: 0.05,
    ease: 'power1.inOut'
  });

  timeline.to(hexOffset.value, {
    x: 0,
    duration: 0.05,
    ease: 'power1.inOut'
  });

  await timeline.play();
});
</script>

<template>
  <HexPositioner
    :x="unit.x"
    :y="unit.y"
    :class="{ 'is-attacking': isAttacking }"
    :style="{
      translate: `${hexOffset.x}px ${hexOffset.y}px`
    }"
  >
    <div
      class="unit"
      :class="[
        isAlly ? 'ally' : 'enemy',
        {
          'is-exhausted': unit.isExhausted,
          'is-selected': ui.selectedUnit?.equals(unit)
        }
      ]"
    >
      <div class="uni-sprite" />
      <div class="unit-border" />
      <div class="atk">
        <span
          class="dual-text"
          :class="{
            buff: unit.atk > unit.baseAtk,
            debuff: unit.atk < unit.baseAtk
          }"
          :data-text="unit.atk"
        >
          {{ unit.atk }}
        </span>
      </div>
      <div class="hp">
        <span
          class="dual-text"
          :class="{
            buff: unit.hp > unit.baseMaxHp,
            debuff: unit.hp < unit.maxHp
          }"
          :data-text="unit.hp"
        >
          {{ unit.hp }}
        </span>
      </div>
      <div class="cmd" v-if="!unit.isGeneral">
        <span
          class="dual-text"
          :class="{
            buff: unit.cmd > unit.baseCmd,
            debuff: unit.cmd < unit.baseCmd
          }"
          :data-text="unit.cmd"
        >
          {{ unit.cmd }}
        </span>
      </div>
      <div class="debug">{{ unit.x }}, {{ unit.y }}</div>
    </div>
  </HexPositioner>
</template>

<style scoped lang="postcss">
.dual-text {
  color: transparent;
  position: relative;
  --_top-color: var(--top-color, #dec7a6);
  --_bottom-color: var(--bottom-color, #bba083);
  &::before,
  &::after {
    position: absolute;
    content: attr(data-text);
    color: transparent;
    inset: 0;
  }
  &:after {
    background: linear-gradient(
      var(--_top-color),
      var(--_top-color) 50%,
      var(--_bottom-color) 50%
    );
    line-height: 1.2;
    background-clip: text;
    background-size: 100% 1lh;
    background-repeat: repeat-y;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
  &:before {
    -webkit-text-stroke: calc(1px * var(--pixel-scale)) black;
    /* z-index: -1; */
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}

.is-attacking {
  z-index: 1;
}
.unit {
  --pixel-scale: 2;
  clip-path: var(--hex-path);
  position: relative;
  background: url('/assets/ui/unit-hex-base.png');
  background-size: cover;
  transition: transform 1s var(--ease-bounce-2);
  pointer-events: none;
  width: 100%;
  height: 100%;

  @starting-style {
    transform: translateY(-100px);
  }

  &.is-selected {
    filter: brightness(1.15);
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('/assets/ui/hex-highlight-unit-selected.png');
    }
  }
}

.uni-sprite {
  position: absolute;
  inset: 0;
  background: v-bind(unitBg);
  background-size: calc(96px * 2) calc(96px * 2);
  background-position: center calc(100%);
  .unit.enemy & {
    transform: scaleX(-1);
  }

  .unit.is-exhausted & {
    filter: grayscale(1) brightness(0.6);
  }
}

.unit-border {
  position: absolute;
  inset: 0;
  background-size: cover;
  .unit.ally & {
    background: url('/assets/ui/unit-hex-border-ally.png');
  }

  .unit.enemy & {
    background: url('/assets/ui/unit-hex-border-enemy.png');
  }
}

:is(.atk, .hp, .cmd) {
  width: 35px;
  height: 30px;
  display: grid;
  place-items: center;
  font-weight: var(--font-weight-7);
  font-size: 16px;
  position: absolute;

  .buff {
    --top-color: var(--green-3);
    --bottom-color: var(--green-6);
  }

  .debuff {
    --top-color: var(--red-4);
    --bottom-color: var(--red-7);
  }
}

.atk {
  background-image: url('/assets/ui/atk-frame-textless.png');
  left: calc(var(--pixel-scale) * 4px);
  top: 50%;
  translate: 0 -50%;
}

.hp {
  background-image: url('/assets/ui/hp-frame-textless.png');
  right: calc(var(--pixel-scale) * 4px);
  top: 50%;
  translate: 0 -50%;
}

.cmd {
  background-image: url('/assets/ui/cmd-frame-textless.png');
  left: 50%;
  bottom: calc(var(--pixel-scale) * 1px);
  translate: -50% 0;
}

.debug {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  opacity: 0;
}
</style>
