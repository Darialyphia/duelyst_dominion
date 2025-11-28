<script setup lang="ts">
import { isDefined, Vec2, type Point } from '@game/shared';
import {
  useBoardCellByPosition,
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer,
  useUnits
} from '../composables/useGameClient';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { makeAoeShape } from '@game/engine/src/aoe/aoe-shape.factory';
import { match } from 'ts-pattern';
import { TARGETING_TYPE } from '@game/engine/src/targeting/targeting-strategy';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';

const { x, y } = defineProps<Point>();

const state = useGameState();
const ui = useGameUi();
const units = useUnits();
const myPlayer = useMyPlayer();

const isTargetable = computed(() => {
  const interaction = state.value.interaction;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }

  return (
    !isInAoe.value &&
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

const isInAoe = computed(() => {
  if (isTargeted.value) return false;
  const { interaction } = state.value;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }
  if (!interaction.ctx.aoe.shape) return false;

  const shape = makeAoeShape(
    interaction.ctx.aoe.shape.type,
    interaction.ctx.aoe.shape.targetingType,
    interaction.ctx.aoe.shape.params
  );

  const targets = [
    ...interaction.ctx.selectedSpaces,
    ui.value.hoveredCell?.position
  ].filter(isDefined);
  const area = shape.getArea(targets);
  const isInArea = area.some(point => point.x === x && point.y === y);
  if (!isInArea) return false;
  const unitOnPosition = units.value.find(u => u.x === x && u.y === y);

  const isValidTargetingType = match(shape.targetingType)
    .with(TARGETING_TYPE.ANYWHERE, () => true)
    .with(TARGETING_TYPE.EMPTY, () => !unitOnPosition)
    .with(TARGETING_TYPE.UNIT, () => !!unitOnPosition)
    .with(
      TARGETING_TYPE.ENEMY_UNIT,
      () => !unitOnPosition?.getPlayer()?.equals(myPlayer.value)
    )
    .with(TARGETING_TYPE.ALLY_UNIT, () =>
      unitOnPosition?.getPlayer()?.equals(myPlayer.value)
    )
    .with(TARGETING_TYPE.ALLY_GENERAL, () => {
      return (
        unitOnPosition?.getPlayer()?.equals(myPlayer.value) &&
        unitOnPosition?.getCard().kind === CARD_KINDS.GENERAL
      );
    })
    .with(TARGETING_TYPE.ALLY_MINION, () => {
      return (
        unitOnPosition?.getPlayer()?.equals(myPlayer.value) &&
        unitOnPosition?.getCard().kind === CARD_KINDS.MINION
      );
    })
    .with(TARGETING_TYPE.ALLY_SHRINE, () => false)
    .with(TARGETING_TYPE.ENEMY_GENERAL, () => {
      return (
        !unitOnPosition?.getPlayer()?.equals(myPlayer.value) &&
        unitOnPosition?.getCard().kind === CARD_KINDS.GENERAL
      );
    })
    .with(TARGETING_TYPE.ENEMY_MINION, () => {
      return (
        !unitOnPosition?.getPlayer()?.equals(myPlayer.value) &&
        unitOnPosition?.getCard().kind === CARD_KINDS.MINION
      );
    })
    .with(TARGETING_TYPE.ENEMY_SHRINE, () => false)
    .with(TARGETING_TYPE.GENERAL, () => {
      return unitOnPosition?.getCard().kind === CARD_KINDS.GENERAL;
    })
    .with(TARGETING_TYPE.MINION, () => {
      return unitOnPosition?.getCard().kind === CARD_KINDS.MINION;
    })
    .with(TARGETING_TYPE.SHRINE, () => false)
    .exhaustive();

  return isValidTargetingType;
});

const isSelectedUnitSpace = computed(() => {
  const selectedUnit = ui.value.selectedUnit;
  if (!selectedUnit) return false;
  return selectedUnit.x === x && selectedUnit.y === y;
});
const { client } = useGameClient();
</script>

<template>
  <div
    class="board-positioner"
    :class="{
      'is-targetable': isTargetable && !client.isPlayingFx,
      'is-targeted': isTargeted && !client.isPlayingFx,
      'can-move-to': canMoveTo && !client.isPlayingFx,
      'can-attack': canAttack && !client.isPlayingFx,
      'is-in-aoe': isInAoe && !client.isPlayingFx,
      'is-selected-unit': isSelectedUnitSpace && !client.isPlayingFx
    }"
  >
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
.board-positioner {
  position: absolute;
  transform: translateX(calc(var(--board-cell-width) * v-bind(x)))
    translateY(calc(var(--board-cell-height) * v-bind(y))) translateZ(0.1px);
  will-change: transform;
  pointer-events: none;
  width: var(--board-cell-width);
  height: var(--board-cell-height);
  z-index: v-bind(y);
  transform-style: preserve-3d;

  * {
    display: none;
  }
  &.is-targetable::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/assets/ui/cell-highlight-targetable.png');
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
    background-image: url('/assets/ui/cell-highlight-selected.png');
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
    background-image: url('/assets/ui/cell-highlight-move-reach.png');
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
    background-image: url('/assets/ui/cell-highlight-attackable.png');
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
    background-image: url('/assets/ui/cell-highlight-aoe.png');
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
    background-image: url('/assets/ui/cell-highlight-unit-selected.png');
    background-size: cover;
    z-index: 1;
    transition: opacity 0.3s var(--ease-3);
    @starting-style {
      opacity: 0;
    }
  }
}
</style>
