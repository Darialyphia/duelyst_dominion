<script setup lang="ts">
import { useSprite } from '@/card/composables/useSprite';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import spritesData from 'virtual:sprites';

const { sprites } = defineProps<{
  sprites: Array<{
    spriteId: string;
    animationSequence: string[];
    scale: number;
    offset: { x: number; y: number };
  }>;
}>();

const buildSprites = () => {
  const parts = sprites.map(s => {
    return {
      ...useSprite({
        sprite: spritesData[s.spriteId],
        animationSequence: s.animationSequence,
        scale: s.scale,
        kind: CARD_KINDS.SPELL,
        pathPrefix: '/fx',
        repeat: false
      }),
      spriteData: spritesData[s.spriteId],
      id: s.spriteId,
      scale: s.scale,
      offset: s.offset
    };
  });

  return parts;
};
const _sprites = buildSprites();
</script>

<template>
  <div ref="spriteContainer" class="sprite-fx-container">
    <template v-for="sprite in _sprites" :key="sprite.id">
      <div
        v-if="!sprite.isDone.value"
        class="sprite-fx"
        :style="{
          '--bg-position': sprite.bgPosition.value,
          '--width': `${sprite.activeFrameRect.value.width}px`,
          '--height': `${sprite.activeFrameRect.value.height}px`,
          '--background-width': `calc(${sprite.scale} * ${sprite.spriteData.sheetSize.w}px)`,
          '--background-height': `calc(${sprite.scale} * ${sprite.spriteData.sheetSize.h}px)`,
          '--offset-x': `${sprite.offset.x}px`,
          '--offset-y': `${sprite.offset.y}px`,
          '--scale': sprite.scale,
          '--image-bg': sprite.imageBg.value
        }"
      />
    </template>
  </div>
</template>

<style scoped lang="postcss">
.sprite-fx-container {
  position: absolute;
}

.sprite-fx {
  --pixel-scale: var(--scale);
  position: absolute;
  /* scale: var(--scale) var(--scale); */
  top: 50%;
  left: 50%;
  translate: calc(-50% + var(--offset-x)) calc(-50% + var(--offset-y));
  width: var(--width);
  height: var(--height);
  background: var(--image-bg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
}
</style>
