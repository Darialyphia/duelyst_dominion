<script setup lang="ts">
import type { Point } from '@game/shared';
import { useGameState } from '../composables/useGameClient';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import { pointToCellId } from '@game/engine/src/board/board-utils';

const { x, y } = defineProps<Point>();

const dimensions = { height: 102, width: 144, x: 94, y: 51 };

const state = useGameState();

const isTargetable = computed(() => {
  const interaction = state.value.interaction;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }

  return interaction.ctx.elligibleSpaces.some(
    spaceId => spaceId === pointToCellId({ x, y })
  );
});
</script>

<template>
  <div
    class="hex"
    :class="{ 'is-targetable': isTargetable }"
    :style="{
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      transform: `translate(${x * dimensions.x}px, ${y * dimensions.height + (x % 2 === 0 ? 0 : dimensions.y)}px)`
    }"
  >
    <slot />
  </div>
</template>

<style scoped lang="postcss">
.hex {
  position: absolute;
  pointer-events: none;

  &.is-targetable::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/assets/ui/hex-highlight-targetable.png');
    background-size: cover;
    z-index: 1;
  }
}
:slotted(div) {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}
</style>
