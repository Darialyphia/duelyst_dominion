<script setup lang="ts">
import {
  useGameClient,
  useGameState,
  useGameUi,
  usePlayer1
} from '../composables/useGameClient';

const player1 = usePlayer1();
const { client } = useGameClient();
const state = useGameState();
const ui = useGameUi();
</script>

<template>
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
</template>

<style scoped lang="postcss">
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
  pointer-events: none;
  /*eslint-disable-next-line vue-scoped-css/no-unused-selector */
  button {
    pointer-events: auto;
  }
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

  &.is-replacing {
    --ui-button-bg: var(--lime-5);
    --ui-button-hover-bg: var(--lime-6);
    --ui-button-color: var(--text-on-primary);
  }
}
</style>
