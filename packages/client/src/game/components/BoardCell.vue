<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import { useGameUi } from '../composables/useGameClient';
import BoardPositioner from './BoardPositioner.vue';
import Sound from '@/ui/components/Sound.vue';
import { isDefined } from '@game/shared';

const { cell } = defineProps<{
  cell: BoardCellViewModel;
}>();

const ui = useGameUi();
</script>

<template>
  <BoardPositioner
    :x="cell.position.x"
    :y="cell.position.y"
    @mouseenter="ui.hover(cell)"
    @mouseleave="ui.unhover()"
    @mouseup="ui.onBoardCellClick(cell, $event)"
  >
    <Sound
      mouseenter="button-hover"
      mouseup="sfx_unit_onclick"
      pitch-shift
      :enabled="isDefined(cell.unit) || isDefined(cell.tile)"
    >
      <div
        class="cell"
        :id="ui.DOMSelectors.cell(cell.position.x, cell.position.y).id"
      />
    </Sound>
  </BoardPositioner>
</template>

<style scoped lang="postcss">
.cell {
  /* background: url('@/assets/ui/board-cell.png'); */

  background-size: cover;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  position: relative;
  &:hover {
    filter: brightness(1.5);
  }
  &::after {
    content: '';
    position: absolute;
    inset: 3px;
    background-color: hsl(0 0% 0% / 0.08);
  }
}
</style>
