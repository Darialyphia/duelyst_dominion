<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { useGameUi, useMyPlayer } from '../composables/useGameClient';
import { isDefined } from '@game/shared';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import BoardPositioner from './BoardPositioner.vue';
import sprites from 'virtual:sprites';
import { uniqBy } from 'lodash-es';
import { useIsInAoe } from '../composables/useIsInAoe';
import SpriteFX from './SpriteFX.vue';
import { useUnitAnimations } from '../composables/useUnitAnimations';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useGameUi();
const myPlayer = useMyPlayer();
const isAlly = computed(() => unit.getPlayer()?.equals(myPlayer.value));
const isFlipped = computed(() => !unit.getPlayer()?.isPlayer1);
const spriteData = computed(() => {
  return sprites[unit.getCard().spriteId];
});

const isSelected = computed(() => ui.value.selectedUnit?.equals(unit) ?? false);

const damageIndicatorEl = useTemplateRef('damageIndicator');

const {
  activeFrameRect,
  bgPosition,
  imageBg,
  positionOffset,
  isAttacking,
  latestDamageReceived,
  isBeingSummoned
} = useUnitAnimations({
  unit,
  isSelected,
  spriteData,
  damageIndicatorEl
});

const isInAoe = useIsInAoe();

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
      class="shadow-wrapper"
      :class="{
        'is-flipped': isFlipped
      }"
      :style="{
        '--parallax-factor': 0.5,
        '--bg-position': bgPosition,
        '--width': `${activeFrameRect.width}px`,
        '--height': `${activeFrameRect.height}px`,
        '--background-width': `calc( ${spriteData.sheetSize.w}px * var(--pixel-scale))`,
        '--background-height': `calc(${spriteData.sheetSize.h}px * var(--pixel-scale))`
      }"
    >
      <div class="shadow" />
    </div>
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
          '--background-width': `calc( ${spriteData.sheetSize.w}px * var(--pixel-scale))`,
          '--background-height': `calc(${spriteData.sheetSize.h}px * var(--pixel-scale))`
        }"
      >
        <div class="sprite">
          <div class="foil" v-if="unit.getCard().isFoil" />
          <div class="foil-glare" v-if="unit.getCard().isFoil" />
        </div>
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
      <div
        ref="damageIndicator"
        v-if="latestDamageReceived"
        class="damage-indicator"
      >
        {{ latestDamageReceived }}
      </div>
      <SpriteFX
        v-if="latestDamageReceived"
        class="fx-container"
        :class="{
          'is-flipped': isFlipped
        }"
        :sprites="[
          {
            spriteId: 'impact',
            animationSequence: ['impactorangebig'],
            scale: 1,
            offset: {
              x: 0,
              y: 0
            }
          },
          {
            spriteId: 'collision',
            animationSequence: ['collisionsparksblue'],
            scale: 1,
            offset: {
              x: -10,
              y: 10
            }
          },
          {
            spriteId: 'bloodground',
            animationSequence: ['bloodground2'],
            scale: 1,
            offset: {
              x: -activeFrameRect.width / 3,
              y: 45
            }
          }
        ]"
      />

      <SpriteFX
        v-if="isBeingSummoned"
        class="fx-container"
        :class="{
          'is-flipped': isFlipped
        }"
        :sprites="[
          {
            spriteId: 'smokeground',
            animationSequence: ['smokeground'],
            scale: 1,
            offset: {
              x: 0,
              y: 40
            }
          }
        ]"
      />

      <div class="modifiers">
        <UiSimpleTooltip
          v-for="modifier in displayedModifiers"
          :key="modifier.id"
          use-portal
          side="left"
          :side-offset="8"
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

          <div class="flex gap-2 items-start">
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
  --foil-animated-toggle: ;

  position: relative;
  pointer-events: none;
  width: 100%;
  height: 100%;
  bottom: 0;
  transform: translateZ(10px) translateY(-15px)
    rotateX(calc(var(--board-angle-X) * -1));
  transform-origin: bottom center;
  & .sprite {
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

  @starting-style {
    transform: translateY(-50px);
  }
}
.sprite,
.shadow {
  width: 100%;
  height: 100%;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
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

.sprite {
  transform: translateY(10px);
}

.shadow-wrapper {
  --pixel-scale: 1;
  pointer-events: none;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  position: absolute;
  bottom: 0;
  left: 50%;
  translate: -50% 0;
  scale: 2;
  transform-origin: bottom center;
  transform-style: preserve-3d;
}

.shadow {
  transform: translateZ(1px) scaleY(-1) translateY(45%) skewX(15deg);
  transform-origin: bottom center;
  filter: brightness(0);
  opacity: 0.25;
  .is-flipped & {
    translate: 12.5% 0;
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
  bottom: -5px;
}

.hp {
  background-image: url('/assets/ui/hp-frame-textless.png');
  background-size: cover;
  right: 0;
  bottom: -5px;
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
  margin-block-start: var(--size-1);
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

.damage-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-8);
  color: var(--red-7);
  pointer-events: none;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.fx-container {
  position: absolute;
  inset: 0;
  &.is-flipped {
    scale: -1 1;
  }
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
  opacity: 0.5;
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
</style>
