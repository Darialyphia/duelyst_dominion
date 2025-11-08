<script setup lang="ts">
import HexPositioner from './HexPositioner.vue';
import { useMyPlayer } from '../composables/useGameClient';
import type { ShrineViewModel } from '@game/engine/src/client/view-models/shrine.model';
import { isDefined } from '@game/shared';

const { shrine } = defineProps<{ shrine: ShrineViewModel }>();

const myPlayer = useMyPlayer();
const isAlly = computed(() => shrine.player?.equals(myPlayer.value));
const isEnemy = computed(() => !isAlly.value && isDefined(shrine.player));
const unitBg = computed(() => {
  return `url('/assets/ui/shrine.png')`;
});

const hexOffset = ref({
  x: 0,
  y: 0
});
</script>

<template>
  <HexPositioner :x="shrine.x" :y="shrine.y" :offset="hexOffset">
    <div
      class="shrine"
      :class="{
        ally: isAlly,
        enemy: isEnemy
      }"
    >
      <div class="shrine-sprite" />
      <div class="shrine-border" />
    </div>
  </HexPositioner>
</template>

<style scoped lang="postcss">
.shrine {
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
}

.shrine-sprite {
  position: absolute;
  inset: 0;
  background: v-bind(unitBg);
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
</style>
