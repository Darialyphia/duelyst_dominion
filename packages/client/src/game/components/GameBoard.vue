<script setup lang="ts">
import { Flip } from 'gsap/Flip';
import {
  useBoardCells,
  useGameState,
  useGameUi,
  useMyPlayer,
  useTiles,
  useUnits
} from '../composables/useGameClient';
import Hand from './Hand.vue';
import Tile from './Tile.vue';
import DraggedCard from './DraggedCard.vue';
import BoardCell from './BoardCell.vue';
import Unit from './Unit.vue';
import PlayedCard from './PlayedCard.vue';
import { useGlobalSounds } from '../composables/useGlobalSounds';
import Camera from './Camera.vue';
import ExplainerMessage from './ExplainerMessage.vue';
import SVGFilters from './SVGFilters.vue';
import Player1Infos from './Player1Infos.vue';
import Player2Infos from './Player2Infos.vue';
import VFX from './VFX.vue';
import HoveredCard from './HoveredCard.vue';
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import NewTurnIndicator from './NewTurnIndicator.vue';
import GameErrorModal from './GameErrorModal.vue';
import ChooseCardModal from './ChooseCardModal.vue';
import { useEventListener, usePageLeave } from '@vueuse/core';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';

const boardCells = useBoardCells();
const tiles = useTiles();
const units = useUnits();
const myPlayer = useMyPlayer();

useGlobalSounds();

const isSettingsOpened = ref(false);
const ui = useGameUi();
const state = useGameState();
const stopDragging = async (cb?: (playedCard: CardViewModel) => void) => {
  await nextTick();
  if (!ui.value.draggedCard) return;
  const card = ui.value.draggedCard;

  ui.value.draggedCard = null;

  cb?.(card);
};

const isOutOfScreen = usePageLeave();

const cancelPlay = (card: CardViewModel) => {
  const el = document.querySelector('#dragged-card [data-game-card]');
  if (!el) return;
  const flipState = Flip.getState(el);
  ui.value.unselectCard();
  card.cancelPlay();
  window.requestAnimationFrame(() => {
    const target = document.querySelector(
      `.hand-card [data-game-card="${card.id}"]`
    );
    Flip.from(flipState, {
      targets: target,
      duration: 0.25,
      absolute: true,
      ease: Power1.easeOut
    });
  });
};
watch(isOutOfScreen, out => {
  if (!out) return;
  stopDragging(card => {
    if (state.value.phase.state !== GAME_PHASES.PLAYING_CARD) return;
    cancelPlay(card);
  });
});

useEventListener('mouseup', async e => {
  stopDragging(card => {
    if (state.value.phase.state !== GAME_PHASES.PLAYING_CARD) return;
    const isWithinBoard = ui.value.DOMSelectors.board.element?.contains(
      e.target as Node
    );
    if (isWithinBoard) return;
    cancelPlay(card);
  });
});
</script>

<template>
  <div class="game-board">
    <DraggedCard />
    <PlayedCard />
    <ChooseCardModal />
    <SVGFilters />

    <Camera>
      <BoardCell v-for="cell in boardCells" :key="cell.id" :cell="cell" />
      <Tile v-for="tile in tiles" :key="tile.id" :tile="tile" />
      <Unit
        v-for="unit in units"
        :key="unit.id"
        :unit="unit"
        class="board-unit"
      />
    </Camera>

    <VFX />
    <NewTurnIndicator />
    <div class="hand">
      <Hand :player-id="myPlayer.id" :key="myPlayer.id" />
    </div>

    <Player1Infos />
    <Player2Infos />
    <ExplainerMessage class="explainer-message" />
    <HoveredCard />

    <div id="dragged-card-container" />
    <div id="card-portal"></div>

    <button
      aria-label="Settings"
      class="settings-button"
      @click="isSettingsOpened = true"
    />
    <UiModal
      v-model:is-opened="isSettingsOpened"
      title="Menu"
      description="Game settings"
      :style="{ '--ui-modal-size': 'var(--size-xs)' }"
    >
      <div class="game-board-menu">
        <FancyButton text="Close" @click="isSettingsOpened = false" />
        <slot name="menu" />
      </div>
    </UiModal>

    <GameErrorModal />
  </div>
</template>

<style scoped lang="postcss">
.game-board {
  width: 100vw;
  height: 100dvh;
  background-size: cover;
  overflow: hidden;
  position: relative;
  transform-style: preserve-3d;
  perspective: 2000px;
  /* background: url(@/assets/backgrounds/battle-bg2.png);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center; */
}
#dragged-card-container {
  perspective: 850px;
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.hand {
  position: fixed;
  width: 100%;
  bottom: 16%;
  left: 0;
}

#card-portal {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
}

.explainer-message {
  position: fixed;
  top: 0;
  left: 50%;
  translate: -50% 0;
}

.settings-button {
  --pixel-scale: 2;
  position: fixed;
  right: var(--size-8);
  bottom: var(--size-6);
  width: calc(32px * var(--pixel-scale));
  aspect-ratio: 1;
  background: url('@/assets/ui/settings-icon.png');
  background-size: cover;
  z-index: 2;
  &:hover {
    filter: brightness(1.2);
  }
}

.game-board-menu {
  display: grid;
  gap: var(--size-2);
  > * {
    width: 100%;
  }
}

#unit-stats-teleport {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform-style: preserve-3d;
}
</style>
