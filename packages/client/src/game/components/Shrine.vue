<script setup lang="ts">
import HexPositioner from './HexPositioner.vue';
import {
  useFxEvent,
  useMyPlayer,
  useOpponentPlayer
} from '../composables/useGameClient';
import type { ShrineViewModel } from '@game/engine/src/client/view-models/shrine.model';
import { isDefined, waitFor } from '@game/shared';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { refAutoReset } from '@vueuse/core';

const { shrine } = defineProps<{ shrine: ShrineViewModel }>();

const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();
const isAlly = computed(() => shrine.player?.equals(myPlayer.value));
const isEnemy = computed(() => !isAlly.value && isDefined(shrine.player));
const unitBg = computed(() => {
  return `url('/assets/ui/shrine.png')`;
});

const displayedCmd = computed(() => {
  return {
    mine: isAlly.value
      ? shrine.defendCmdByPlayer[myPlayer.value.id]
      : shrine.attackCmdByPlayer[myPlayer.value.id],
    opponent: isAlly.value
      ? shrine.attackCmdByPlayer[opponent.value.id]
      : shrine.defendCmdByPlayer[opponent.value.id]
  };
});

const isCapturing = refAutoReset(false, 1200);
useFxEvent(FX_EVENTS.SHRINE_BEFORE_CAPTURE, async event => {
  if (event.shrine !== shrine.id) return;
  isCapturing.value = true;
  await waitFor(1200);
});
</script>

<template>
  <HexPositioner :x="shrine.x" :y="shrine.y">
    <div
      class="shrine"
      :class="{
        ally: isAlly,
        enemy: isEnemy,
        capturable: shrine.capturableByPlayer[myPlayer.id],
        'is-capturing': isCapturing
      }"
    >
      <div class="shrine-sprite" />
      <div class="shrine-border" />
      <div class="my-cmd">
        <span class="dual-text" :data-text="displayedCmd.mine">
          {{ displayedCmd.mine }}
        </span>
      </div>
      <div class="opponent-cmd">
        <span class="dual-text" :data-text="displayedCmd.opponent">
          {{ displayedCmd.opponent }}
        </span>
      </div>
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

.shrine {
  --pixel-scale: 2;
  clip-path: var(--hex-path);
  position: relative;
  background: url('/assets/ui/unit-hex-base.png');
  background-size: cover;
  transition:
    transform 1s var(--ease-bounce-2),
    filter 0.5s var(--ease-2);
  pointer-events: none;
  width: 100%;
  height: 100%;
  &.is-capturing {
    filter: brightness(4);
  }
  @starting-style {
    transform: translateY(-100px);
  }
}

.shrine-sprite {
  position: absolute;
  inset: 0;
  background: v-bind(unitBg);
  .shrine.ally &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--blue-5);
    mix-blend-mode: overlay;
    z-index: 1;
    mask-image: v-bind(unitBg);
  }

  .shrine.enemy &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--red-6);
    mix-blend-mode: overlay;
    z-index: 1;
    mask-image: v-bind(unitBg);
  }
  background-size: center;
  .unit.enemy & {
    transform: scaleX(-1);
  }

  .unit.is-exhausted & {
    filter: grayscale(1) brightness(0.6);
  }
}

.shrine-border {
  position: absolute;
  inset: 0;
  background-size: cover;
  background: url('/assets/ui/unit-hex-border-neutral.png');
  .shrine.ally & {
    background: url('/assets/ui/unit-hex-border-ally.png');
  }

  .shrine.enemy & {
    background: url('/assets/ui/unit-hex-border-enemy.png');
  }
}

:is(.my-cmd, .opponent-cmd) {
  width: 35px;
  height: 30px;
  display: grid;
  place-items: center;
  font-weight: var(--font-weight-7);
  font-size: 16px;
  position: absolute;
}

.my-cmd {
  background-image: url('/assets/ui/shrine-cmd-ally.png');
  left: calc(var(--pixel-scale) * 4px);
  top: 50%;
  translate: 0 -50%;

  .capturable & {
    --top-color: var(--green-4);
    --bottom-color: var(--green-6);
  }
}

.opponent-cmd {
  background-image: url('/assets/ui/shrine-cmd-enemy.png');
  right: calc(var(--pixel-scale) * 4px);
  top: 50%;
  translate: 0 -50%;
}
</style>
