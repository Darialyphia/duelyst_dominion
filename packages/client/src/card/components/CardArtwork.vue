<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { CardKind } from '@game/engine/src/card/card.enums';
import { useSprite } from '../composables/useSprite';

const props = defineProps<{
  sprite: {
    id: string;
    frameSize: { w: number; h: number };
    sheetSize: { w: number; h: number };
    animations: Record<
      string,
      { startFrame: number; endFrame: number; frameDuration: number }
    >;
  };
  animationSequence?: string[];
  kind: CardKind;
  isFoil?: boolean;
  isTiltable?: boolean;
  isHovered?: boolean;
}>();

const isSpell = computed(() => props.kind.toLowerCase() === 'spell');
const disableParallax = computed(() => !props.isTiltable || !props.isFoil);

const { activeFrameRect, bgPosition, imageBg } = useSprite({
  animationSequence: toRef(props, 'animationSequence'),
  sprite: toRef(props, 'sprite'),
  kind: toRef(props, 'kind'),
  scale: 2,
  scalePositionByPixelScale: true
});
</script>

<template>
  <div
    class="image parallax"
    :class="{
      'is-spell': isSpell,
      'disable-parallax': disableParallax,
      'is-hovered': isHovered,
      'is-foil': isFoil
    }"
    :style="{
      '--parallax-factor': 0.5,
      '--bg-position': bgPosition,
      '--width': `${activeFrameRect.width}px`,
      '--height': `${activeFrameRect.height}px`,
      '--background-width': `calc(2 * ${props.sprite.sheetSize.w}px * var(--pixel-scale))`,
      '--background-height': `calc(2 * ${props.sprite.sheetSize.h}px * var(--pixel-scale))`
    }"
  >
    <div class="image-shadow" />
    <div class="image-sprite" />
  </div>
</template>

<style scoped lang="postcss">
.image {
  position: absolute;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  /* pointer-events: none; */
  bottom: calc(105px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  &.is-spell {
    bottom: calc(140px * var(--pixel-scale));
  }

  .image-shadow {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    pointer-events: none;
    background: v-bind(imageBg);
    background-position: var(--bg-position);
    background-repeat: no-repeat;
    background-size: var(--background-width) var(--background-height);
    translate: calc(-5 * var(--parallax-x))
      calc(-5 * var(--parallax-y) - var(--pixel-scale) * 20px);
    filter: contrast(0) brightness(0) blur(4px);
    transition: opacity 1s var(--ease-3);
    scale: 1.15;
  }

  &.is-hovered.is-foil .image-shadow {
    opacity: 0.35;
  }

  &.disable-parallax .image-shadow {
    translate: 0 0 !important;
  }

  .image-sprite {
    position: absolute;
    width: 100%;
    height: 100%;
    background: v-bind(imageBg);
    background-position: var(--bg-position);
    background-repeat: no-repeat;
    background-size: var(--background-width) var(--background-height);
    translate: calc(var(--parallax-x, 0)) var(--parallax-y, 0) !important;
    pointer-events: none;
  }

  &.disable-parallax .image-sprite {
    translate: 0 0 !important;
  }
}
</style>
