<script setup lang="ts">
import { useRafFn } from '@vueuse/core';
import Stats from 'stats.js';

const stats = new Stats();

const statsRoot = useTemplateRef('statsRoot');
onMounted(() => {
  stats.showPanel(0);
  statsRoot.value?.appendChild(stats.dom);
});

stats.begin();
useRafFn(() => {
  stats.end();
  stats.begin();
});

const isDev = import.meta.env.DEV;
</script>

<template>
  <div v-if="isDev" ref="statsRoot" class="fps" />
</template>

<style scoped>
.fps {
  position: fixed;
  top: var(--size-5);
  right: var(--size-11);
  transform: translateZ(0);
}
</style>
