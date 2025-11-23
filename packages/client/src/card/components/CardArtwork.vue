<script setup lang="ts">
import { computed } from 'vue';
import { CARD_KINDS, type CardKind } from '@game/engine/src/card/card.enums';
import { isDefined } from '@game/shared';

const props = defineProps<{
  sprite: {
    id: string;
    frameSize: { w: number; h: number };
    animations: string[];
    frameDuration: number;
  };
  animation?: string;
  kind: CardKind;
  isFoil?: boolean;
  isTiltable?: boolean;
  isHovered?: boolean;
}>();

const imageBg = computed(() => {
  return `url('${props.sprite.id}')`;
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
    style="--parallax-factor: 1.5"
  >
    <div class="image-shadow" />
    <div class="image-sprite" />
  </div>
</template>

<style scoped lang="postcss">
.image {
  position: absolute;
  width: calc(2 * 96px * var(--pixel-scale));
  height: calc(2 * 96px * var(--pixel-scale));
  pointer-events: none;

  &.is-spell {
    top: calc(-10px * var(--pixel-scale));
  }

  .image-shadow {
    position: absolute;
    width: calc(2 * 96px * var(--pixel-scale));
    height: calc(2 * 96px * var(--pixel-scale));
    opacity: 0;
    pointer-events: none;
    background: v-bind(imageBg);
    background-size: cover;
    background-position: center calc(-62px * var(--pixel-scale));
    background-repeat: no-repeat;
    translate: calc(-2 * var(--parallax-x))
      calc(-2 * var(--parallax-y) - var(--pixel-scale) * 6px);
    filter: contrast(0) brightness(0) blur(3px);
    scale: 1.15;
    transition: opacity 1s var(--ease-3);
  }

  &.is-hovered.is-foil .image-shadow {
    opacity: 0.35;
  }

  &.disable-parallax .image-shadow {
    translate: 0 0 !important;
  }

  .image-sprite {
    position: absolute;
    width: calc(2 * 96px * var(--pixel-scale));
    height: calc(2 * 96px * var(--pixel-scale));
    background: v-bind(imageBg);
    background-size: cover;
    background-position: center calc(-62px * var(--pixel-scale));
    background-repeat: no-repeat;
    top: calc(5px * var(--pixel-scale));
    translate: calc(var(--parallax-x, 0)) var(--parallax-y, 0) !important;
    pointer-events: none;
  }

  &.disable-parallax .image-sprite {
    translate: 0 0 !important;
  }
}
</style>
