<script setup lang="ts">
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

interface Modifier {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  stacks: number;
}

const { modifiers } = defineProps<{
  modifiers: Modifier[];
}>();
</script>

<template>
  <div class="modifiers">
    <UiSimpleTooltip
      v-for="modifier in modifiers"
      :key="modifier.id"
      use-portal
      side="right"
      :side-offset="12"
    >
      <template #trigger>
        <div
          :style="{
            '--bg': `url(/assets/${modifier.icon}.png)`,
            '--pixel-scale': 1
          }"
          :alt="modifier.name"
          :data-stacks="modifier.stacks > 1 ? modifier.stacks : undefined"
          class="modifier-image"
        />
      </template>

      <div class="modifier">
        <img :src="`/assets/${modifier.icon}.png`" class="modifier-image" />
        <div>
          <div class="font-7">{{ modifier.name }}</div>
          {{ modifier.description }}
        </div>
      </div>
    </UiSimpleTooltip>
  </div>
</template>

<style scoped lang="postcss">
.modifiers {
  position: absolute;
  top: var(--size-2);
  right: 0;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-auto-flow: column;
  direction: rtl;
}

.modifier-image {
  width: 24px;
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

.modifier {
  display: grid;
  align-items: start;
  gap: var(--size-3);
  grid-template-columns: auto 1fr;
  .modifier-image {
    width: calc(24px * 2);
  }
}
</style>
