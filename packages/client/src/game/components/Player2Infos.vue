<script setup lang="ts">
import { usePlayer2 } from '../composables/useGameClient';
import EquipedArtifact from './EquipedArtifact.vue';
import DiscardPile from './DiscardPile.vue';

const player2 = usePlayer2();
</script>

<template>
  <div class="p2-infos">
    <header>
      <div class="flex flex-col gap-2">
        {{ player2.name }}
        <DiscardPile :player="player2" />
      </div>
      <div class="flex gap-2">
        <div
          v-for="i in Math.max(player2.maxMana, player2.mana)"
          :key="i"
          class="mana"
          :class="{ spent: i <= player2.spentMana }"
        />
      </div>
    </header>

    <div class="flex flex-col items-end gap-2 mt-5">
      <EquipedArtifact
        v-for="artifact in player2.artifacts"
        :key="artifact.id"
        :artifact="artifact"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.p2-infos {
  position: fixed;
  top: var(--size-9);
  right: var(--size-11);
  color: white;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  pointer-events: none;

  /*eslint-disable-next-line vue-scoped-css/no-unused-selector */
  button {
    pointer-events: auto;
  }
}

header {
  transform: skewY(5deg);
  font-size: var(--font-size-4);
  display: grid;
  grid-gap: var(--size-2);
  justify-items: end;
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
</style>
