<script setup lang="ts">
import {
  useGameClient,
  useGameState,
  usePlayer2
} from '../composables/useGameClient';
import EquipedArtifact from './EquipedArtifact.vue';
import DiscardPile from './DiscardPile.vue';
import { Icon } from '@iconify/vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

const player2 = usePlayer2();
const { playerId } = useGameClient();
const state = useGameState();
</script>

<template>
  <div class="p2-infos">
    <header :class="{ active: state.turnPlayer === player2.id }">
      <div class="flex flex-col gap-2 items-end">
        <div class="flex gap-7 items-center justify-between">
          <div class="hp">
            {{ player2.currentHp }}
          </div>
          {{ player2.name }}
        </div>
        <div class="flex gap-2 text-1">
          <DiscardPile :player="player2" />
          <UiSimpleTooltip>
            <template #trigger>
              <div class="pointer-events-auto flex gap-2">
                <Icon icon="mdi:cards-outline" />
                ({{ player2.handSize }})
              </div>
            </template>
            {{ player2.handSize }}/{{ state.config.MAX_HAND_SIZE }} card{{
              player2.handSize !== 1 ? 's' : ''
            }}
            in
            {{ player2.id === playerId ? 'your' : "opponent's" }} hand
          </UiSimpleTooltip>

          <UiSimpleTooltip>
            <template #trigger>
              <div class="pointer-events-auto flex gap-2">
                <Icon icon="tabler:stack-3-filled" />
                ({{ player2.remainingCardsInDeck.length }})
              </div>
            </template>
            {{ player2.remainingCardsInDeck.length }} card{{
              player2.remainingCardsInDeck.length !== 1 ? 's' : ''
            }}
            remaining in
            {{ player2.id === playerId ? 'your' : "opponent's" }} deck
          </UiSimpleTooltip>
        </div>
      </div>
    </header>
    <div class="flex gap-2 justify-end">
      <div
        v-for="i in Math.max(player2.maxMana, player2.mana)"
        :key="i"
        class="mana"
        :class="{ spent: i <= player2.spentMana }"
      />
    </div>

    <div class="flex flex-col items-end gap-2">
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
  right: var(--size-13);
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

.hp {
  background: linear-gradient(135deg, var(--red-7) 0%, var(--red-9) 100%);
  padding: var(--size-3) var(--size-4);
  font-size: var(--font-size-5);
  font-weight: bold;
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
  min-width: var(--size-9);
  text-align: center;
  clip-path: polygon(10% 15%, 90% 15%, 90% 65%, 50% 100%, 10% 65%);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
}

header {
  font-size: var(--font-size-4);
  display: grid;
  grid-gap: var(--size-2);
  justify-items: end;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  background-color: hsla(0 0% 0% / 0.35);
  padding: var(--size-3);
  border-radius: var(--radius-3);
  backdrop-filter: blur(5px);
  border: solid var(--border-size-3) transparent;

  &.active {
    border-color: var(--yellow-6);
  }

  /*eslint-disable-next-line vue-scoped-css/no-unused-selector */
  svg {
    stroke: black;
    stroke-width: 4px;
  }
}

.mana {
  width: 34px;
  aspect-ratio: 1;
  background: url('@/assets/ui/mana.png') no-repeat center/contain;
  filter: drop-shadow(0 0 4px hsl(0 0 0 / 0.5));

  &.spent {
    background: url('@/assets/ui/mana-spent.png') no-repeat center/contain;
  }
}
</style>
