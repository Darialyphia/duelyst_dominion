<script setup lang="ts">
import { useSprite } from '@/card/composables/useSprite';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { ANIMATIONS_NAMES } from '@game/engine/src/game/systems/vfx.system';
import type { SerializedPlayerArtifact } from '@game/engine/src/player/player-artifact.entity';
import sprites from 'virtual:sprites';
import { useCard } from '../composables/useGameClient';
import {
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger
} from 'reka-ui';
import GameCard from './GameCard.vue';

const { artifact } = defineProps<{
  artifact: SerializedPlayerArtifact;
}>();

const card = useCard(computed(() => artifact.card));

const spriteData = computed(() => sprites[card.value.spriteId]);
const { activeFrameRect, bgPosition, imageBg } = useSprite({
  kind: CARD_KINDS.ARTIFACT,
  sprite: spriteData,
  animationSequence: [ANIMATIONS_NAMES.DEFAULT]
});
</script>

<template>
  <HoverCardRoot :open-delay="0" :close-delay="0">
    <HoverCardTrigger>
      <div
        class="equiped-artifact"
        :data-durability="artifact.durability"
        :style="{
          '--parallax-factor': 0.5,
          '--bg-position': bgPosition,
          '--width': `${activeFrameRect.width}px`,
          '--height': `${activeFrameRect.height}px`,
          '--background-width': `calc( ${spriteData.sheetSize.w}px * var(--pixel-scale))`,
          '--background-height': `calc(${spriteData.sheetSize.h}px * var(--pixel-scale))`
        }"
      >
        <div class="sprite" />
      </div>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent>
        <GameCard :cardId="card.id" style="--pixel-scale: 1.5" />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.equiped-artifact {
  position: relative;
  --pixel-scale: 1;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  transform-origin: bottom center;
  transition: opacity 0.3s var(--ease-2);
  pointer-events: auto;
  @starting-style {
    opacity: 0;
  }

  &::after {
    content: attr(data-durability);
    position: absolute;
    bottom: -15px;
    right: 5px;
    font-size: var(--font-size-2);
    color: white;
    paint-order: stroke fill;
    font-weight: var(--font-weight-7);
    -webkit-text-stroke: 2px black;
  }
}

.sprite {
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  pointer-events: none;
  position: absolute;
  transform: translateY(10px);
}
</style>
