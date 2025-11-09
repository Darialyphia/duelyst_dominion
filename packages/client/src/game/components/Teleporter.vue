<script setup lang="ts">
import HexPositioner from './HexPositioner.vue';
import type { TeleporterViewModel } from '@game/engine/src/client/view-models/teleporter.model';

const { teleporter } = defineProps<{ teleporter: TeleporterViewModel }>();

const bgUrl = computed(() => {
  return `url('${teleporter.imagePath}')`;
});
</script>

<template>
  <HexPositioner
    v-for="gate in teleporter.gates"
    :key="`${gate.x}_${gate.y}`"
    :x="gate.x"
    :y="gate.y"
  >
    <div class="teleporter" />
  </HexPositioner>
</template>

<style scoped lang="postcss">
.teleporter {
  --pixel-scale: 2;
  clip-path: var(--hex-path);
  position: relative;
  background: v-bind(bgUrl);
  background-size: cover;
  transition: transform 1s var(--ease-bounce-2);
  pointer-events: none;
  width: 100%;
  height: 100%;

  @starting-style {
    transform: translateY(-100px);
  }
}
</style>
