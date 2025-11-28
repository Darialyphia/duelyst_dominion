<script setup lang="ts">
import UiButton from '@/ui/components/UiButton.vue';
import {
  useBoardCells,
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer,
  useOpponentPlayer,
  useUnits
} from '../composables/useGameClient';
import Hand from './Hand.vue';
import Unit from './Unit.vue';
import { RUNES } from '@game/engine/src/card/card.enums';
import DraggedCard from './DraggedCard.vue';
import BoardCell from './BoardCell.vue';
import FPS from './FPS.vue';
import GameCard from './GameCard.vue';
import { config } from '@/utils/config';
// import { useMouse, useWindowSize } from '@vueuse/core';

const state = useGameState();
const { client } = useGameClient();
const boardCells = useBoardCells();
const units = useUnits();
const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();

// const { x, y } = useMouse();
// const { width, height } = useWindowSize();

const boardStyle = computed(() => ({
  width: `${state.value.board.columns * config.CELL.width}px`,
  height: `${state.value.board.rows * config.CELL.height}px`
  // '--board-angle-X': `${(y.value / height.value - 0.5) * -180}deg`,
  // '--board-angle-Y': `${(x.value / width.value - 0.5) * 180}deg`
}));

const ui = useGameUi();
const hoveredCard = computed(() => {
  if (!ui.value.hoveredCell) return null;
  return ui.value.hoveredCell.unit?.getCard();
});
</script>

<template>
  <div class="game-board">
    <DraggedCard />
    <FPS />

    <div :id="ui.DOMSelectors.board.id" class="board" :style="boardStyle">
      <BoardCell v-for="cell in boardCells" :key="cell.id" :cell="cell" />
      <Unit v-for="unit in units" :key="unit.id" :unit="unit" />
    </div>

    <div class="hand">
      <Hand :player-id="myPlayer.id" :key="myPlayer.id" />
    </div>

    <div class="my-infos">
      {{ myPlayer.name }}

      <div class="flex gap-2">
        <div
          v-for="i in myPlayer.maxMana"
          :key="i"
          class="mana"
          :class="{ spent: i <= myPlayer.spentMana }"
        />
        <div
          v-for="i in myPlayer.maxOverspentMana"
          :key="i"
          class="mana overspent"
          :class="{ spent: i <= myPlayer.overspentMana }"
        />
      </div>

      <div class="flex gap-5">
        <div class="rune-count">
          <img src="/assets/ui/rune-red.png" />
          {{ myPlayer.runes.red }}
        </div>
        <div class="rune-count">
          <img src="/assets/ui/rune-yellow.png" />
          {{ myPlayer.runes.yellow }}
        </div>
        <div class="rune-count">
          <img src="/assets/ui/rune-blue.png" />
          {{ myPlayer.runes.blue }}
        </div>
      </div>
      <UiButton
        v-show="myPlayer.canUseResourceAction"
        class="action-button red"
        @click="client.gainRune(RUNES.RED)"
      >
        Gain Red Rune
      </UiButton>
      <UiButton
        v-show="myPlayer.canUseResourceAction"
        class="action-button yellow"
        @click="client.gainRune(RUNES.YELLOW)"
      >
        Gain Yellow Rune
      </UiButton>
      <UiButton
        v-show="myPlayer.canUseResourceAction"
        class="action-button blue"
        @click="client.gainRune(RUNES.BLUE)"
      >
        Gain Blue Rune
      </UiButton>
      <UiButton
        v-show="myPlayer.canUseResourceAction"
        class="action-button"
        @click="client.drawCard()"
      >
        Draw Card
      </UiButton>
      <UiButton
        v-show="myPlayer.canReplace"
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

    <div class="opponent-infos">
      {{ opponent.name }}

      <div class="flex gap-2 flex-row-reverse">
        <div
          v-for="i in opponent.maxMana"
          :key="i"
          class="mana"
          :class="{ spent: i <= opponent.spentMana }"
        />
        <div
          v-for="i in opponent.maxOverspentMana"
          :key="i"
          class="mana overspent"
          :class="{ spent: i <= opponent.overspentMana }"
        />
      </div>
      <div class="flex gap-5 flex-1 flex-row-reverse">
        <div class="rune-count">
          <img src="/assets/ui/rune-red.png" />
          {{ opponent.runes.red }}
        </div>
        <div class="rune-count">
          <img src="/assets/ui/rune-yellow.png" />
          {{ opponent.runes.yellow }}
        </div>
        <div class="rune-count">
          <img src="/assets/ui/rune-blue.png" />
          {{ opponent.runes.blue }}
        </div>
      </div>
    </div>

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
  </div>
</template>

<style scoped lang="postcss">
.game-board {
  width: 100vw;
  height: 100vh;
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

.board {
  --board-angle-X: 20deg;
  --board-angle-Y: 0deg;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%) rotateY(var(--board-angle-Y))
    rotateX(var(--board-angle-X));
  transform-style: preserve-3d;
}

.hand {
  position: fixed;
  width: 100%;
  bottom: 22%;
  left: 0;
}

.my-infos,
.opponent-infos {
  pointer-events: none;
  /*eslint-disable-next-line vue-scoped-css/no-unused-selector */
  button {
    pointer-events: auto;
  }
}
.my-infos {
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

.opponent-infos {
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
  &.spent {
    background-color: var(--color);
  }
  &.overspent {
    --color: magenta;
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
</style>
