<script setup lang="ts">
import {
  useGameClient,
  useGameUi,
  usePlayer1
} from '../composables/useGameClient';
import UiButton from '@/ui/components/UiButton.vue';
import EquipedArtifact from './EquipedArtifact.vue';
import DiscardPile from './DiscardPile.vue';

const player1 = usePlayer1();
const { client } = useGameClient();
const ui = useGameUi();
</script>

<template>
  <div class="p1-infos">
    <header>
      <div class="flex flex-col gap-2">
        {{ player1.name }}
        <DiscardPile :player="player1" />
      </div>

      <div class="flex gap-2">
        <div
          v-for="i in Math.max(player1.maxMana, player1.mana)"
          :key="i"
          class="mana"
          :class="{ spent: i <= player1.spentMana }"
        />
      </div>
    </header>

    <div class="flex flex-col gap-2 mt-5">
      <EquipedArtifact
        v-for="artifact in player1.artifacts"
        :key="artifact.id"
        :artifact="artifact"
      />
    </div>

    <UiButton
      v-show="player1.canReplace"
      class="action-button mt-9"
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
  top: var(--size-9);
  left: var(--size-11);
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

header {
  transform: skewY(-5deg);
  font-size: var(--font-size-4);
  display: grid;
  grid-gap: var(--size-2);
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.mana {
  width: 34px;
  aspect-ratio: 1;
  background: url('@/assets/ui/mana.png') no-repeat center/contain;
  &.spent {
    background: url('@/assets/ui/mana-spent.png') no-repeat center/contain;
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
