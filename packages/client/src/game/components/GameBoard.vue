<script setup lang="ts">
import UiButton from '@/ui/components/UiButton.vue';
import {
  useBoardCells,
  useFxEvent,
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer,
  useOpponentPlayer,
  usePlayer1,
  usePlayer2,
  useTiles,
  useUnits
} from '../composables/useGameClient';
import Hand from './Hand.vue';
import Tile from './Tile.vue';
import Unit from './Unit.vue';
import { RUNES } from '@game/engine/src/card/card.enums';
import DraggedCard from './DraggedCard.vue';
import BoardCell from './BoardCell.vue';
import GameCard from './GameCard.vue';
import PlayedCard from './PlayedCard.vue';
import { useGlobalSounds } from '../composables/useGlobalSounds';
import Camera from './Camera.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import ExplainerMessage from './ExplainerMessage.vue';
import EquipedArtifact from './EquipedArtifact.vue';

const { client } = useGameClient();
const boardCells = useBoardCells();
const tiles = useTiles();
const units = useUnits();
const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();
const state = useGameState();
const player1 = usePlayer1();
const player2 = usePlayer2();

useGlobalSounds();

const ui = useGameUi();
const hoveredCard = computed(() => {
  if (!ui.value.hoveredCell) return null;
  return ui.value.hoveredCell.unit?.getCard();
});

const isVfxOverlayDisplayed = ref(false);
useFxEvent(FX_EVENTS.CARD_BEFORE_PLAY, () => {
  isVfxOverlayDisplayed.value = true;
});
useFxEvent(FX_EVENTS.CARD_AFTER_PLAY, () => {
  isVfxOverlayDisplayed.value = false;
});
</script>

<template>
  <div class="game-board">
    <DraggedCard />
    <!-- <FPS /> -->
    <PlayedCard />

    <Camera>
      <BoardCell v-for="cell in boardCells" :key="cell.id" :cell="cell" />
      <Tile v-for="tile in tiles" :key="tile.id" :tile="tile" />
      <Unit v-for="unit in units" :key="unit.id" :unit="unit" />
    </Camera>
    <Transition appear>
      <div class="vfx-overlay" v-if="isVfxOverlayDisplayed" />
    </Transition>

    <div class="hand">
      <Hand :player-id="myPlayer.id" :key="myPlayer.id" />
    </div>

    <div class="p1-infos">
      {{ player1.name }}

      <div class="flex gap-2">
        <div
          v-for="i in Math.max(player1.maxMana, player1.mana)"
          :key="i"
          class="mana"
          :class="{ spent: i <= player1.spentMana }"
        />
      </div>

      <div v-if="state.config.FEATURES.RUNES" class="flex gap-5">
        <div class="rune-count">
          <img src="/assets/ui/rune-red.png" />
          {{ player1.runes.red }}
        </div>
        <div class="rune-count">
          <img src="/assets/ui/rune-yellow.png" />
          {{ player1.runes.yellow }}
        </div>
        <div class="rune-count">
          <img src="/assets/ui/rune-blue.png" />
          {{ player1.runes.blue }}
        </div>
      </div>

      <div class="flex flex-col gap-2 mt-2">
        <EquipedArtifact
          v-for="artifact in player1.artifacts"
          :key="artifact.id"
          :artifact="artifact"
        />
      </div>

      <UiButton
        v-if="state.config.FEATURES.RUNES"
        v-show="player1.canUseResourceAction"
        class="action-button red"
        @click="client.gainRune(RUNES.RED)"
      >
        Gain Red Rune
      </UiButton>
      <UiButton
        v-if="state.config.FEATURES.RUNES"
        v-show="player1.canUseResourceAction"
        class="action-button yellow"
        @click="client.gainRune(RUNES.YELLOW)"
      >
        Gain Yellow Rune
      </UiButton>
      <UiButton
        v-if="state.config.FEATURES.RUNES"
        v-show="myPlayer.canUseResourceAction"
        class="action-button blue"
        @click="client.gainRune(RUNES.BLUE)"
      >
        Gain Blue Rune
      </UiButton>
      <UiButton
        v-if="state.config.FEATURES.RUNES"
        v-show="player1.canUseResourceAction"
        class="action-button"
        @click="client.drawCard()"
      >
        Draw Card
      </UiButton>
      <UiButton
        v-show="player1.canReplace"
        class="action-button"
        :class="{ 'is-replacing': ui.isReplacingCard }"
        @click="ui.isReplacingCard = !ui.isReplacingCard"
      >
        Replace Card
      </UiButton>
      <UiButton class="action-button" @click="client.endTurn()">
        End Turn
      </UiButton>
    </div>

    <div class="p2-infos">
      {{ player2.name }}
      <div class="flex gap-2 flex-row-reverse">
        <div
          v-for="i in Math.max(player2.maxMana, player2.mana)"
          :key="i"
          class="mana"
          :class="{ spent: i <= player2.spentMana }"
        />
      </div>
      <div
        v-if="state.config.FEATURES.RUNES"
        class="flex gap-5 flex-1 flex-row-reverse"
      >
        <div class="rune-count">
          <img src="/assets/ui/rune-red.png" />
          {{ player2.runes.red }}
        </div>
        <div class="rune-count">
          <img src="/assets/ui/rune-yellow.png" />
          {{ player2.runes.yellow }}
        </div>
        <div class="rune-count">
          <img src="/assets/ui/rune-blue.png" />
          {{ player2.runes.blue }}
        </div>
      </div>
    </div>

    <ExplainerMessage class="explainer-message" />

    <div
      class="hovered-card"
      v-if="hoveredCard"
      :class="{
        ally: hoveredCard.getPlayer().equals(myPlayer),
        enemy: hoveredCard.getPlayer().equals(opponent)
      }"
    >
      <GameCard :card-id="hoveredCard.id" :is-interactive="false" />
    </div>
    <div id="dragged-card-container" />
    <div id="card-portal"></div>
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
  bottom: 22%;
  left: 0;
}

.vfx-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, transparent, black 75%);
  opacity: 0.7;
  pointer-events: none;
  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.5s;
  }
  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}

.p1-infos,
.p2-infos {
  pointer-events: none;
  /*eslint-disable-next-line vue-scoped-css/no-unused-selector */
  button {
    pointer-events: auto;
  }
}
.p1-infos {
  position: fixed;
  top: var(--size-8);
  left: var(--size-8);
  color: white;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--size-2);
}

.p2-infos {
  position: fixed;
  top: var(--size-8);
  right: var(--size-8);
  color: white;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--size-2);
}

.mana {
  --color: cyan;
  width: var(--size-5);
  aspect-ratio: 1;
  border-radius: var(--radius-round);
  border: solid var(--border-size-2) var(--color);
  background-color: transparent;
  &:not(.spent) {
    background-color: var(--color);
  }
}

.action-button {
  width: var(--size-12);
  --ui-button-bg: var(--gray-10);
  --ui-button-hover-bg: var(--gray-8);
  --ui-button-color: white;

  &.red {
    --ui-button-bg: var(--red-5);
    --ui-button-hover-bg: var(--red-6);
    --ui-button-color: var(--text-on-primary);
  }
  &.blue {
    --ui-button-bg: var(--blue-3);
    --ui-button-hover-bg: var(--blue-5);
    --ui-button-color: var(--text-on-primary);
  }
  &.yellow {
    --ui-button-bg: var(--yellow-3);
    --ui-button-hover-bg: var(--yellow-5);
    --ui-button-color: var(--text-on-primary);
  }

  &.is-replacing {
    --ui-button-bg: var(--lime-5);
    --ui-button-hover-bg: var(--lime-6);
    --ui-button-color: var(--text-on-primary);
  }
}

.rune-count {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: var(--font-size-4);
  --pixel-scale: 2;
  img {
    width: calc(17px * var(--pixel-scale));
    height: calc(21px * var(--pixel-scale));
  }
}

.hovered-card {
  --pixel-scale: 1.5;
  position: fixed;
  bottom: var(--size-9);
  &.ally {
    left: var(--size-6);
  }
  &.enemy {
    right: var(--size-6);
  }
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
</style>
