<script setup lang="ts">
import { useTemplateRef } from 'vue';
import CardText from './CardText.vue';
import type { CardKind } from '@game/engine/src/card/card.enums';
import { useResizeObserver } from '@vueuse/core';

defineProps<{
  description: string;
  kind: CardKind;
}>();

const getPixelScale = () => {
  let el: HTMLElement | null = descriptionBox.value;
  if (!el) return 1;
  let scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  while (!scale) {
    if (!el!.parentElement) return 1;
    el = el!.parentElement;
    scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  }

  return parseFloat(scale) || 1;
};

const setVariableFontSize = (
  box: HTMLElement,
  sizeRef: Ref<number>,
  min: number,
  max: number
) => {
  const inner = box.firstChild as HTMLElement;
  const outerHeight = box.clientHeight;

  if (inner.clientHeight <= outerHeight) {
    return;
  }
  let size = max;
  const step = 0.5;
  const scale = getPixelScale(); // text size uses half pixel scale in calculation

  while (inner.clientHeight > outerHeight && size > min) {
    size -= step;
    box.style.fontSize = `${size * scale}px`;
  }
  box.style.fontSize = '';
  sizeRef.value = size;
};
const descriptionBox = useTemplateRef('description-box');

const DESCRIPTION_MIN_TEXT_SIZE = 8;
const DESCRIPTION_MAX_TEXT_SIZE = 11;
const descriptionFontSize = ref(DESCRIPTION_MAX_TEXT_SIZE);

const resizeDescription = () => {
  if (!descriptionBox.value) return;
  setVariableFontSize(
    descriptionBox.value,
    descriptionFontSize,
    DESCRIPTION_MIN_TEXT_SIZE,
    DESCRIPTION_MAX_TEXT_SIZE
  );
};

useResizeObserver(descriptionBox, resizeDescription);
</script>

<template>
  <div
    ref="description-box"
    class="description parallax"
    :class="kind.toLowerCase()"
  >
    <CardText :text="description" />
  </div>
</template>

<style scoped lang="postcss">
.description {
  height: calc(67px * var(--pixel-scale));
  position: absolute;
  top: calc(180px * var(--pixel-scale));
  left: calc(43px * var(--pixel-scale));
  width: calc(100% - (66px * var(--pixel-scale)));
  font-size: calc(1px * var(--pixel-scale) * v-bind(descriptionFontSize));
  overflow: hidden;
  line-height: 1.2;
  text-shadow: 0 0 0.75rem black;
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;

  &.spell,
  &.artifact {
    left: calc(22px * var(--pixel-scale));
    width: calc(100% - (46px * var(--pixel-scale)));
  }

  &.is-multi-line {
    text-align: left;
  }
  > * {
    display: inline-block;
  }
}
</style>
