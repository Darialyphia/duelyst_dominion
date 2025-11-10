<script setup lang="ts">
import UiButton from '@/ui/components/UiButton.vue';
import {
  useBoardCells,
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer,
  useOpponentPlayer,
  useShrines,
  useTeleporters,
  useUnits
} from '../composables/useGameClient';
import Hand from './Hand.vue';
import Unit from './Unit.vue';
import { RUNES } from '@game/engine/src/card/card.enums';
import DraggedCard from './DraggedCard.vue';
import BoardCell from './BoardCell.vue';
import FPS from './FPS.vue';
import Shrine from './Shrine.vue';
import Teleporter from './Teleporter.vue';
import GameCard from './GameCard.vue';

const state = useGameState();
const { client } = useGameClient();
const boardCells = useBoardCells();
const units = useUnits();
const shrines = useShrines();
const teleporters = useTeleporters();
const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();
const dimensions = { height: 102, width: 144, x: 94, y: 51 };

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

    <div
      class="board"
      :style="{
        width: `${state.board.columns * dimensions.x + dimensions.width - dimensions.x}px`,
        height: `${state.board.rows * dimensions.height + dimensions.y}px`
      }"
    >
      <BoardCell v-for="cell in boardCells" :key="cell.id" :cell="cell" />
      <Shrine v-for="shrine in shrines" :key="shrine.id" :shrine="shrine" />
      <Teleporter
        v-for="teleporter in teleporters"
        :key="teleporter.id"
        :teleporter="teleporter"
      />
      <Unit v-for="unit in units" :key="unit.id" :unit="unit" />
    </div>

    <div class="hand">
      <Hand :player-id="myPlayer.id" :key="myPlayer.id" />
    </div>

    <div class="my-infos">
      {{ myPlayer.name }}
      <div class="flex gap-2">
        <div
          v-for="i in state.config.VICTORY_POINT_GOAL"
          :key="i"
          class="victory-point"
          :class="{ filled: i <= myPlayer.victoryPoints }"
        />
      </div>
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
      <UiButton class="action-button" @click="client.endTurn()">
        End Turn
      </UiButton>
    </div>

    <div class="opponent-infos">
      {{ opponent.name }}
      <div class="flex gap-2 flex-row-reverse">
        <div
          v-for="i in state.config.VICTORY_POINT_GOAL"
          :key="i"
          class="victory-point"
          :class="{ filled: i <= opponent.victoryPoints }"
        />
      </div>
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
    </div>

    <div class="fixed bottom-2 right-2">
      <GameCard
        v-if="hoveredCard"
        :card-id="hoveredCard.id"
        :is-interactive="false"
      />
    </div>
    <div id="dragged-card-container" />
  </div>
</template>

<style scoped lang="postcss">
#dragged-card-container {
  perspective: 850px;
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.board {
  position: absolute;
  top: var(--size-6);
  left: 50%;
  transform: translateX(-50%);
}

.hand {
  position: fixed;
  width: 75%;
  bottom: 22%;
  left: var(--size-8);
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

.victory-point {
  --color: gold;
  width: var(--size-5);
  aspect-ratio: 1;
  border-radius: var(--radius-round);
  border: solid var(--border-size-2) var(--color);
  background-color: transparent;
  &.filled {
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
</style>
