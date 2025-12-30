<script setup lang="ts">
import {
  useBoardCells,
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

const boardCells = useBoardCells();
const tiles = useTiles();
const units = useUnits();
const myPlayer = useMyPlayer();

useGlobalSounds();

const isSettingsOpened = ref(false);
</script>

<template>
  <div class="game-board">
    <DraggedCard />
    <PlayedCard />
    <SVGFilters />

    <Camera>
      <BoardCell v-for="cell in boardCells" :key="cell.id" :cell="cell" />
      <Tile v-for="tile in tiles" :key="tile.id" :tile="tile" />
      <TransitionGroup>
        <Unit
          v-for="unit in units"
          :key="unit.id"
          :unit="unit"
          class="board-unit"
        />
      </TransitionGroup>
    </Camera>

    <VFX />

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
  perspective: 1500px;
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

.board-unit:is(.v-enter-active, .v-leave-active) {
  transition: opacity 0.3s var(--ease-3);
}
.board-unit:is(.v-enter-from, .v-leave-to) {
  opacity: 0;
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
</style>
