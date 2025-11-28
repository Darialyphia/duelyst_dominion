<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import {
  useFxEvent,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import gsap from 'gsap';
import { config } from '@/utils/config';
import { isDefined, type Point } from '@game/shared';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import BoardPositioner from './BoardPositioner.vue';
import { useSprite } from '@/card/composables/useSprite';
import sprites from 'virtual:sprites';
import { uniqBy } from 'lodash-es';
import { useIsInAoe } from '../composables/useIsInAoe';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useGameUi();
const myPlayer = useMyPlayer();
const isAlly = computed(() => unit.getPlayer()?.equals(myPlayer.value));
const isFlipped = computed(() => !unit.getPlayer()?.isPlayer1);
const sprite = computed(() => {
  return sprites[unit.getCard().spriteId];
});
const defaultAnimation = computed(() =>
  ui.value.selectedUnit?.equals(unit) ? 'idle' : 'breathing'
);
const animationSequence = ref([defaultAnimation.value]);
watchEffect(() => {
  animationSequence.value = [defaultAnimation.value];
});
const { activeFrameRect, bgPosition, imageBg, ...spriteControls } = useSprite({
  animationSequence: animationSequence,
  sprite,
  kind: computed(() => unit.getCard().kind),
  scale: 1
});

const isInAoe = useIsInAoe();

const positionOffset = ref({
  x: 0,
  y: 0
});

useFxEvent(FX_EVENTS.UNIT_AFTER_MOVE, async event => {
  if (event.unit !== unit.id) return;
  const { path, previousPosition } = event;

  const stepDuration = 0.5;

  animationSequence.value = ['run'];
  const timeline = gsap.timeline();

  path.forEach((point, index) => {
    const prev = index === 0 ? previousPosition : path[index - 1];
    const prevScaled = config.CELL.toScreenPosition(prev);
    const destinationScaled = config.CELL.toScreenPosition(point);
    const deltaX = destinationScaled.x - prevScaled.x;
    const deltaY = destinationScaled.y - prevScaled.y;

    // First half: move forward and up
    timeline.to(positionOffset.value, {
      x: `+=${deltaX}`,
      y: `+=${deltaY}`,
      duration: stepDuration,
      ease: Power0.easeNone
    });
  });

  timeline.set(positionOffset.value, { x: 0, y: 0 });

  await timeline.play();
  animationSequence.value = [defaultAnimation.value];
});

const isAttacking = ref(false);
const onAttack = async (event: { unit: string; target: Point }) => {
  if (event.unit !== unit.id) return;
  return new Promise<void>(resolve => {
    isAttacking.value = true;
    animationSequence.value = ['attack'];
    const unsub = spriteControls.on('frame', ({ index, total }) => {
      const percentage = (index + 1) / total;
      if (percentage < 0.75) return; // Wait until halfway through the animation
      animationSequence.value = [defaultAnimation.value];
      isAttacking.value = false;
      unsub();
      resolve();
    });
  });
};
useFxEvent(FX_EVENTS.UNIT_BEFORE_ATTACK, onAttack);
useFxEvent(FX_EVENTS.UNIT_BEFORE_COUNTERATTACK, onAttack);

useFxEvent(FX_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE, async event => {
  if (event.unit !== unit.id) return;

  return new Promise<void>(resolve => {
    isAttacking.value = true;
    animationSequence.value = ['hit'];
    const unsub = spriteControls.on('sequenceEnd', () => {
      animationSequence.value = [defaultAnimation.value];
      isAttacking.value = false;
      unsub();
      resolve();
    });
  });
});

useFxEvent(FX_EVENTS.UNIT_BEFORE_DESTROY, async event => {
  if (event.unit !== unit.id) return;

  return new Promise<void>(resolve => {
    isAttacking.value = true;
    animationSequence.value = ['death'];
    const unsub = spriteControls.on('sequenceEnd', () => {
      animationSequence.value = [defaultAnimation.value];
      isAttacking.value = false;
      unsub();
      resolve();
    });
  });
});

const displayedModifiers = computed(() => {
  return uniqBy(
    [...unit.modifiers, ...unit.getCard().modifiers].filter(
      mod => isDefined(mod.icon) && mod.stacks > 0
    ),
    'modifierType'
  );
});
</script>

<template>
  <BoardPositioner
    :x="unit.x"
    :y="unit.y"
    :class="{ 'is-attacking': isAttacking }"
    :style="{
      translate: `${positionOffset.x}px ${positionOffset.y}px`
    }"
  >
    <div
      class="unit"
      :class="[
        isAlly ? 'ally' : 'enemy',
        {
          'in-aoe': isInAoe({ x: unit.x, y: unit.y }),
          'is-exhausted': unit.isExhausted,
          'is-selected': ui.selectedUnit?.equals(unit),
          'is-flipped': isFlipped
        }
      ]"
    >
      <div
        class="sprite-wrapper"
        :style="{
          '--parallax-factor': 0.5,
          '--bg-position': bgPosition,
          '--width': `${activeFrameRect.width}px`,
          '--height': `${activeFrameRect.height}px`,
          '--background-width': `calc( ${sprite.sheetSize.w}px * var(--pixel-scale))`,
          '--background-height': `calc(${sprite.sheetSize.h}px * var(--pixel-scale))`
        }"
      >
        <div class="sprite" />
      </div>
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

      <div class="modifiers">
        <UiSimpleTooltip
          v-for="modifier in displayedModifiers"
          :key="modifier.id"
          use-portal
          side="left"
        >
          <template #trigger>
            <div
              :style="{
                '--bg': `url(/assets/${modifier.icon}.png)`,
                '--pixel-scale': 1
              }"
              :alt="modifier.name"
              :data-stacks="modifier.stacks > 1 ? modifier.stacks : undefined"
              class="modifier"
            />
          </template>

          <div class="flex items-start">
            <img :src="`/assets/${modifier.icon}.png`" class="modifier" />
            <div>
              <div class="font-7">{{ modifier.name }}</div>
              {{ modifier.description }}
            </div>
          </div>
        </UiSimpleTooltip>
      </div>
    </div>
  </BoardPositioner>
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
  position: relative;
  pointer-events: none;
  width: 100%;
  height: 100%;
  transform: translateZ(30px) rotateX(calc(var(--board-angle-X) * -1));

  &.is-selected {
    filter: brightness(1.15);
  }
}

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
  transition: transform 0.8s var(--ease-bounce-2);
  .is-flipped & {
    scale: -2 2;
  }
  .is-selected & {
    filter: drop-shadow(0 0 1px white);
  }
  @starting-style {
    transform: translateY(-50px);
  }
}
.sprite {
  width: 100%;
  height: 100%;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  translate: calc(var(--parallax-x, 0)) var(--parallax-y, 0) !important;
  pointer-events: none;
  position: absolute;

  .in-aoe &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.3;
    mix-blend-mode: color;
    mask-image: v-bind(imageBg);
    mask-position: var(--bg-position);
    mask-repeat: no-repeat;
    mask-size: var(--background-width) var(--background-height);
  }
  .ally &::after {
    background-color: #03ff79;
  }
  .enemy &::after {
    background-color: #ae3030;
    opacity: 1;
  }
}

:is(.atk, .hp) {
  width: 35px;
  height: 30px;
  display: grid;
  place-items: center;
  font-weight: var(--font-weight-7);
  font-size: 17px;
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
  background-size: cover;
  left: 0;
  bottom: 0;
}

.hp {
  background-image: url('/assets/ui/hp-frame-textless.png');
  background-size: cover;
  right: 0;
  bottom: 0;
}

.modifiers {
  position: absolute;
  top: var(--size-2);
  right: 0;
  display: flex;
  flex-direction: column;
  --pixel-scale: 2;
}

.modifier {
  width: calc(24px * var(--pixel-scale));
  aspect-ratio: 1;
  background: var(--bg) no-repeat center center;
  background-size: cover;
  pointer-events: auto;
  position: relative;
  &::after {
    content: attr(data-stacks);
    position: absolute;
    bottom: -5px;
    right: -5px;
    font-size: var(--font-size-2);
    color: white;
    paint-order: stroke fill;
    font-weight: var(--font-weight-7);
    -webkit-text-stroke: 2px black;
  }
}
</style>
