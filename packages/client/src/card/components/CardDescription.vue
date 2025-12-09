<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useAutoResizeText } from '../composables/useAutoResizeText';
import CardText from './CardText.vue';
import type { CardKind } from '@game/engine/src/card/card.enums';

defineProps<{
  description: string;
  kind: CardKind;
}>();

const descriptionBox = useTemplateRef('description-box');
const { fontSize: descriptionFontSize } = useAutoResizeText(descriptionBox, {
  min: 12,
  max: 21
});
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
  font-size: calc(var(--pixel-scale) * 0.5px * v-bind(descriptionFontSize));
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
  > span {
    width: 1px;
    height: 1px;
    align-self: start;
    vertical-align: top;
  }
}
</style>
