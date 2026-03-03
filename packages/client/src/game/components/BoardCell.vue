<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import BoardPositioner from './BoardPositioner.vue';
import Sound from '@/ui/components/Sound.vue';
import { isDefined, Vec2 } from '@game/shared';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useIsInAoe } from '../composables/useIsInAoe';

const { cell } = defineProps<{
  cell: BoardCellViewModel;
}>();

const ui = useGameUi();
const state = useGameState();

const isTargetable = computed(() => {
  const interaction = state.value.interaction;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }

  return (
    !isTargeted.value &&
    interaction.ctx.elligibleSpaces.some(
      spaceId =>
        spaceId === pointToCellId({ x: cell.position.x, y: cell.position.y })
    )
  );
});

const isTargeted = computed(() => {
  const { interaction, phase } = state.value;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }

  if (
    interaction.ctx.selectedSpaces.some(
      space =>
        pointToCellId(space) ===
        pointToCellId({ x: cell.position.x, y: cell.position.y })
    )
  ) {
    return true;
  }

  if (phase.state === GAME_PHASES.PLAYING_CARD) {
    const card = state.value.entities[phase.ctx.card] as CardViewModel;
    if (!card) return false;
    return card.spacesToHighlight.some(point =>
      Vec2.fromPoint(point).equals({ x: cell.position.x, y: cell.position.y })
    );
  }

  return false;
});

const canMoveTo = computed(() => {
  if (!ui.value.selectedUnit) return false;
  return ui.value.selectedUnit.canMoveTo(cell);
});

const canAttack = computed(() => {
  if (!ui.value.selectedUnit) return false;
  return ui.value.selectedUnit.canAttackAt(cell);
});
const isInAoe = useIsInAoe();

const { client } = useGameClient();
</script>

<template>
  <BoardPositioner
    :x="cell.position.x"
    :y="cell.position.y"
    @mouseenter="ui.hover(cell)"
    @mouseleave="ui.unhover()"
    @mouseup="ui.onBoardCellClick(cell)"
  >
    <Sound
      mouseenter="button-hover"
      mouseup="sfx_unit_onclick"
      pitch-shift
      :enabled="isDefined(cell.unit) || isDefined(cell.tile)"
    >
      <div
        class="cell"
        :class="{
          'is-in-aoe':
            isInAoe({ x: cell.position.x, y: cell.position.y }) &&
            !client.isPlayingFx,
          'is-targetable': isTargetable && !client.isPlayingFx,
          'is-targeted': isTargeted && !client.isPlayingFx,
          'can-move-to': canMoveTo && !client.isPlayingFx,
          'can-attack': canAttack && !client.isPlayingFx
        }"
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
    background-color: hsl(0 0% 100% / 0.25);
  }

  &.is-targetable::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('@/assets/ui/cell-highlight-targetable.png');
    background-size: cover;
    z-index: 1;
    transition: opacity 0.3s var(--ease-3);
    @starting-style {
      opacity: 0;
    }
  }
  &.is-targeted::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('@/assets/ui/cell-highlight-targeted.png');
    background-size: cover;
    z-index: 1;
    transition: opacity 0.3s var(--ease-3);
    @starting-style {
      opacity: 0;
    }
  }
  &.can-move-to::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('@/assets/ui/cell-highlight-move-reach.png');
    background-size: cover;
    z-index: 1;
    transition: opacity 0.3s var(--ease-3);
    @starting-style {
      opacity: 0;
    }
  }
  &.can-attack::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('@/assets/ui/cell-highlight-attackable.png');
    background-size: cover;
    z-index: 1;
    transition: opacity 0.3s var(--ease-3);
    @starting-style {
      opacity: 0;
    }
  }
  &.is-in-aoe::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('@/assets/ui/cell-highlight-aoe.png');
    background-size: cover;
    z-index: 1;
    transition: opacity 0.3s var(--ease-3);
    @starting-style {
      opacity: 0;
    }
  }
  /* &.is-selected-unit::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('@/assets/ui/cell-highlight-unit-selected.png');
    background-size: cover;
    z-index: 1;
    transition: opacity 0.3s var(--ease-3);
    @starting-style {
      opacity: 0;
    }
  } */
}
</style>
