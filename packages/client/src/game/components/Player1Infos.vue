<script setup lang="ts">
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useGameUi,
  usePlayer1
} from '../composables/useGameClient';
import UiButton from '@/ui/components/UiButton.vue';
import EquipedArtifact from './EquipedArtifact.vue';
import DiscardPile from './DiscardPile.vue';
import { Icon } from '@iconify/vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

const player1 = usePlayer1();
const { client, playerId } = useGameClient();
const ui = useGameUi();
const state = useGameState();

useFxEvent(FX_EVENTS.PLAYER_AFTER_TAKE_DAMAGE, event => {
  if (event.player !== player1.value.id) return;

  const newHP = player1.value.currentHp - event.amount;
  const count = { value: player1.value.currentHp };
  gsap.to(count, {
    value: newHP,
    duration: 0.5,
    snap: 'value',
    ease: Power1.easeOut,
    onUpdate: () => {
      player1.value.update({ currentHp: count.value });
    }
  });
});
</script>

<template>
  <div class="p1-infos">
    <header :class="{ active: state.turnPlayer === player1.id }">
      <div class="flex flex-col gap-2">
        <div class="flex gap-7 items-center justify-between">
          {{ player1.name }}
          <div class="hp">
            {{ player1.currentHp }}
          </div>
        </div>
        <div class="flex gap-2 text-1">
          <DiscardPile :player="player1" />
          <UiSimpleTooltip>
            <template #trigger>
              <div class="pointer-events-auto flex gap-2">
                <Icon icon="mdi:cards-outline" />
                ({{ player1.handSize }})
              </div>
            </template>
            {{ player1.handSize }}/{{ state.config.MAX_HAND_SIZE }} card{{
              player1.handSize !== 1 ? 's' : ''
            }}
            in
            {{ player1.id === playerId ? 'your' : "opponent's" }} hand
          </UiSimpleTooltip>

          <UiSimpleTooltip>
            <template #trigger>
              <div class="pointer-events-auto flex gap-2">
                <Icon icon="tabler:stack-3-filled" />
                ({{ player1.remainingCardsInDeck.length }})
              </div>
            </template>
            {{ player1.remainingCardsInDeck.length }} card{{
              player1.remainingCardsInDeck.length !== 1 ? 's' : ''
            }}
            remaining in
            {{ player1.id === playerId ? 'your' : "opponent's" }} deck
          </UiSimpleTooltip>
        </div>
      </div>
    </header>
    <div class="flex gap-2 items-center">
      <div
        v-for="i in Math.max(player1.maxMana, player1.mana)"
        :key="i"
        class="mana"
        :class="{ spent: i > player1.mana }"
      />
      (+ {{ player1.manaRegen }} )
    </div>

    <div class="flex flex-col gap-2">
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
    <UiButton class="action-button" @click="client.pass()">Pass</UiButton>
  </div>
</template>

<style scoped lang="postcss">
.p1-infos {
  position: fixed;
  top: var(--size-9);
  left: var(--size-13);
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
  font-size: var(--font-size-4);
  display: grid;
  grid-gap: var(--size-2);
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
