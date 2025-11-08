<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import HexPositioner from './HexPositioner.vue';
import { useGameUi, useMyPlayer } from '../composables/useGameClient';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useGameUi();
const myPlayer = useMyPlayer();
const isAlly = computed(() => unit.getPlayer()?.equals(myPlayer.value));
const unitBg = computed(() => {
  return `url(${unit.getCard().imagePath})`;
});
</script>

<template>
  <HexPositioner :x="unit.x" :y="unit.y">
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
        <span class="dual-text" :data-text="unit.atk">
          {{ unit.atk }}
        </span>
      </div>
      <div class="hp">
        <span class="dual-text" :data-text="unit.hp">
          {{ unit.hp }}
        </span>
      </div>
      <div class="cmd" v-if="!unit.isGeneral">{{ unit.cmd }}</div>
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
</style>
