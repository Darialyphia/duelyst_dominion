<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useAutoResizeText } from '../composables/useAutoResizeText';

defineProps<{
  name: string;
}>();

const nameBox = useTemplateRef('name-box');
const { fontSize: nameFontSize } = useAutoResizeText(nameBox, {
  min: 14,
  max: 18
});
</script>

<template>
  <div ref="name-box" class="name parallax">
    <svg viewBox="0 0 500 200" class="w-full">
      <defs>
        <radialGradient id="name-gradient">
          <stop offset="15%" stop-color="#cbb599" />
          <stop offset="80%" stop-color="#9a8270" />
        </radialGradient>
      </defs>

      <path
        id="curve"
        d="
        M 0 150
        C 150 100 350 100 500 150
        "
      />
      <text>
        <textPath
          class="name-text"
          xlink:href="#curve"
          text-anchor="middle"
          startOffset="50%"
          stroke="black"
          paint-order="stroke"
          fill="url(#name-gradient)"
        >
          {{ name }}
        </textPath>
      </text>
    </svg>
  </div>
</template>

<style scoped lang="postcss">
.name {
  position: absolute;
  top: calc(108px * var(--pixel-scale));
  width: 100%;
  text-align: center;
  font-weight: bold;

  svg path {
    fill: transparent;
  }

  svg text {
    font-size: calc(1px * v-bind(nameFontSize) * var(--pixel-scale));
    fill: #dbc4a4;
    filter: drop-shadow(0 calc(2.5px * var(--pixel-scale)) 0 black);
  }
}
</style>
