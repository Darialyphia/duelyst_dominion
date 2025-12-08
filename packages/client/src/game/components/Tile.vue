<script setup lang="ts">
import sprites, { type SpriteData } from 'virtual:sprites';
import BoardPositioner from './BoardPositioner.vue';

import type { TileViewModel } from '@game/engine/src/client/view-models/tile.model';
import { useSprite } from '@/card/composables/useSprite';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';

const { tile } = defineProps<{ tile: TileViewModel }>();
const spriteData = computed<SpriteData>(() => sprites[tile.spriteId]);

const { activeFrameRect, bgPosition, imageBg } = useSprite({
  animationSequence: ['default'],
  sprite: spriteData,
  kind: CARD_KINDS.MINION,
  scale: 1,
  pathPrefix: '/tiles'
});
</script>

<template>
  <BoardPositioner :x="tile.x" :y="tile.y">
    <div class="tile" v-if="spriteData">
      <div
        class="sprite-wrapper"
        :style="{
          '--bg-position': bgPosition,
          '--width': `${activeFrameRect.width}px`,
          '--height': `${activeFrameRect.height}px`,
          '--background-width': `calc( ${spriteData.sheetSize.w}px * var(--pixel-scale))`,
          '--background-height': `calc(${spriteData.sheetSize.h}px * var(--pixel-scale))`
        }"
      >
        <div class="sprite" />
      </div>
    </div>
    <p v-else>unknown tile</p>
  </BoardPositioner>
</template>

<style scoped lang="postcss">
.tile {
  --pixel-scale: 2;
  pointer-events: none;
  width: 100%;
  height: 100%;
  bottom: 0;
  transform: rotateX(calc(var(--board-angle-X) * -1))
    rotateY(calc(var(--board-angle-Y) * -1));
  transform-origin: bottom center;
}

.sprite-wrapper {
  --pixel-scale: 1;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  position: absolute;
  bottom: 0;
  left: 50%;
  translate: -50% 0;
  scale: 2;
  transform-origin: bottom center;
}

.sprite {
  width: 100%;
  height: 100%;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  pointer-events: none;
  position: absolute;
  transform: translateY(10px);
}
</style>
