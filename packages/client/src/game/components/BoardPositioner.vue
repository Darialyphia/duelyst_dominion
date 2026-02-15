<script setup lang="ts">
import { Vec2, type Point } from '@game/shared';
import {
  useBoardCellByPosition,
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useIsInAoe } from '../composables/useIsInAoe';

const {
  x,
  y,
  canHighlight = true
} = defineProps<Point & { canHighlight?: boolean }>();

const state = useGameState();
const ui = useGameUi();

const isTargetable = computed(() => {
  const interaction = state.value.interaction;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }

  return (
    !isTargeted.value &&
    interaction.ctx.elligibleSpaces.some(
      spaceId => spaceId === pointToCellId({ x, y })
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
      space => pointToCellId(space) === pointToCellId({ x, y })
    )
  ) {
    return true;
  }

  if (phase.state === GAME_PHASES.PLAYING_CARD) {
    const card = state.value.entities[phase.ctx.card] as CardViewModel;
    if (!card) return false;
    return card.spacesToHighlight.some(point =>
      Vec2.fromPoint(point).equals({ x, y })
    );
  }

  return false;
});

const cell = useBoardCellByPosition(computed(() => ({ x, y })));
const canMoveTo = computed(() => {
  if (!ui.value.selectedUnit) return false;
  return ui.value.selectedUnit.canMoveTo(cell.value);
});

const canAttack = computed(() => {
  if (!ui.value.selectedUnit) return false;
  return ui.value.selectedUnit.canAttackAt(cell.value);
});
const isInAoe = useIsInAoe();

const { client } = useGameClient();

// hack to add a separation between players, Ill figure a cleaner way enngine side later
const offsetedY = computed(() => (y >= state.value.board.rows / 2 ? y + 1 : y));
</script>

<template>
  <div
    class="board-positioner"
    :class="{
      'is-highlightable': canHighlight,
      'is-in-aoe': isInAoe({ x, y }) && !client.isPlayingFx,
      'is-targetable': isTargetable && !client.isPlayingFx,
      'is-targeted': isTargeted && !client.isPlayingFx,
      'can-move-to': canMoveTo && !client.isPlayingFx,
      'can-attack': canAttack && !client.isPlayingFx
    }"
  >
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
.board-positioner {
  position: absolute;
  transform: translateX(calc(var(--board-cell-width) * v-bind(x)))
    translateY(calc(var(--board-cell-height) * v-bind(offsetedY)))
    translateZ(0.1px);
  pointer-events: none;
  width: var(--board-cell-width);
  height: var(--board-cell-height);
  z-index: v-bind(y);
  transform-style: preserve-3d;

  * {
    display: none;
  }

  &.is-highlightable {
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
    &.is-selected-unit::after {
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
    }
  }
}
</style>
