<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import { CARD_KINDS, type CardKind } from '@game/engine/src/card/card.enums';
import { isDefined } from '@game/shared';

const props = defineProps<{
  sprite: {
    id: string;
    frameSize: { w: number; h: number };
    animations: Record<string, { startFrame: number; endFrame: number }>;
    frameDuration: number;
  };

  animation?: string;
  kind: CardKind;
  isFoil?: boolean;
  isTiltable?: boolean;
  isHovered?: boolean;
}>();

const imageBg = computed(() => {
  return `url(/assets/cards/${props.sprite.id}.png)`;
});

const isSpell = computed(() => props.kind.toLowerCase() === 'spell');
const disableParallax = computed(() => !props.isTiltable || !props.isFoil);

const shouldAnimate = computed(() => isDefined(props.animation));
const FALLBACK_ANIMATION_BY_KIND: Record<CardKind, string> = {
  [CARD_KINDS.MINION]: 'breathing',
  [CARD_KINDS.GENERAL]: 'breathing',
  [CARD_KINDS.SPELL]: 'default',
  [CARD_KINDS.ARTIFACT]: 'default'
};
const animationToUse = computed(() => {
  return props.animation ?? FALLBACK_ANIMATION_BY_KIND[props.kind];
});

const currentAnimation = computed(
  () => props.sprite.animations[animationToUse.value]
);
const currentFrame = ref(0);

watch(
  currentAnimation,
  anim => {
    if (anim) {
      currentFrame.value = anim.startFrame;
    } else {
      currentFrame.value = 0;
    }
  },
  { immediate: true }
);

useIntervalFn(
  () => {
    if (!currentAnimation.value || !shouldAnimate.value) return;
    const { startFrame, endFrame } = currentAnimation.value;

    if (currentFrame.value >= endFrame) {
      currentFrame.value = startFrame;
    } else {
      currentFrame.value++;
    }
  },
  () => props.sprite.frameDuration
);

const activeFrameRect = computed(() => {
  return {
    x: currentFrame.value * props.sprite.frameSize.w,
    y: 0,
    width: props.sprite.frameSize.w,
    height: props.sprite.frameSize.h
  };
});

const bgPosition = computed(() => {
  const { x, y } = activeFrameRect.value;
  return `calc(-1 * ${x}px) calc(-1 * ${y}px)`;
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
      '--parallax-factor': 0.75,
      '--bg-position': bgPosition,
      '--width': `${activeFrameRect.width}px`,
      '--height': `${activeFrameRect.height}px`
    }"
  >
    <div class="image-shadow" />
    <div class="image-sprite" />
  </div>
</template>

<style scoped lang="postcss">
.image {
  position: absolute;
  width: calc(var(--width));
  height: calc(var(--height));
  pointer-events: none;
  scale: calc(2 * var(--pixel-scale));
  bottom: calc(180px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-12.5%);

  &.is-spell {
    top: calc(-10px * var(--pixel-scale));
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
    translate: calc(-2 * var(--parallax-x))
      calc(-2 * var(--parallax-y) - var(--pixel-scale) * 6px);
    filter: contrast(0) brightness(0) blur(2px);
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
    translate: calc(var(--parallax-x, 0)) var(--parallax-y, 0) !important;
    pointer-events: none;
  }

  &.disable-parallax .image-sprite {
    translate: 0 0 !important;
  }
}
</style>
