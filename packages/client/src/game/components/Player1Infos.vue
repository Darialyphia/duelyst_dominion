<script setup lang="ts">
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import UiButton from '@/ui/components/UiButton.vue';
import EquipedArtifact from './EquipedArtifact.vue';
import DiscardPile from './DiscardPile.vue';
import { Icon } from '@iconify/vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

const player = useMyPlayer();
const { playerId } = useGameClient();
const ui = useGameUi();
const state = useGameState();

useFxEvent(FX_EVENTS.PLAYER_AFTER_TAKE_DAMAGE, event => {
  const p = player.value;
  if (event.player !== p.id) return;

  const newHP = p.currentHp - event.amount;
  const count = { value: p.currentHp };
  gsap.to(count, {
    value: newHP,
    duration: 0.5,
    snap: 'value',
    ease: Power1.easeOut,
    onUpdate: () => {
      p.update({ currentHp: count.value });
    }
  });
});
</script>

<template>
  <div class="p1-infos">
    <header
      :class="{ active: state.turnPlayer === player.id }"
      :id="ui.DOMSelectors.playerInfos(player.id).id"
    >
      <div class="flex flex-col gap-2">
        <div class="flex gap-5 items-center">
          <div class="hp">
            {{ player.currentHp }}
          </div>
          {{ player.name }}
        </div>
        <div class="flex gap-3">
          <div>Lvl {{ player.level }}</div>
          <div v-if="player.level < player.maxLevel">
            EXP {{ player.exp }}/{{ state.config.EXP_PER_LEVEL }}
          </div>
        </div>
        <div class="flex gap-2 text-1">
          <DiscardPile :player="player" />
          <UiSimpleTooltip>
            <template #trigger>
              <div class="pointer-events-auto flex gap-2">
                <Icon icon="mdi:cards-outline" />
                ({{ player.handSize }})
              </div>
            </template>
            {{ player.handSize }}/{{ state.config.MAX_HAND_SIZE }} card{{
              player.handSize !== 1 ? 's' : ''
            }}
            in
            {{ player.id === playerId ? 'your' : "opponent's" }} hand
          </UiSimpleTooltip>

          <UiSimpleTooltip>
            <template #trigger>
              <div class="pointer-events-auto flex gap-2">
                <Icon icon="tabler:stack-3-filled" />
                ({{ player.remainingCardsInDeck.length }})
              </div>
            </template>
            {{ player.remainingCardsInDeck.length }} card{{
              player.remainingCardsInDeck.length !== 1 ? 's' : ''
            }}
            remaining in
            {{ player.id === playerId ? 'your' : "opponent's" }} deck
          </UiSimpleTooltip>
        </div>
      </div>
    </header>

    <div
      class="flex gap-2 items-center"
      :id="ui.DOMSelectors.mana(player.id).id"
    >
      <div
        v-for="i in Math.max(player.maxMana, player.mana)"
        :key="i"
        class="mana"
        :class="{ spent: i > player.mana }"
      />
      (+ {{ player.manaRegen }} )
    </div>

    <div class="flex flex-col gap-2">
      <EquipedArtifact
        v-for="artifact in player.artifacts"
        :key="artifact.id"
        :artifact="artifact"
      />
    </div>

    <div class="actions">
      <UiButton
        v-for="action in ui.globalActions"
        :key="action.id"
        :disabled="action.isDisabled"
        class="w-full"
        :class="[action.id, { 'is-replacing': ui.isReplacingCard }]"
        :id="ui.DOMSelectors.actionButton(action.id).id"
        @click="action.onClick"
      >
        {{ action.label }}
      </UiButton>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.p1-infos {
  position: fixed;
  top: min(var(--size-9), 5vh);
  left: min(var(--size-13), 8vw);
  color: white;
  font-weight: bold;
  gap: var(--size-2);
  pointer-events: none;
  /*eslint-disable-next-line vue-scoped-css/no-unused-selector */
  button {
    pointer-events: auto;
  }
}

header {
  min-width: 24ch;
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
  margin-block-end: var(--size-4);

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

.actions {
  margin-top: var(--size-9);
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
  > * {
    width: var(--size-12);
    --ui-button-bg: var(--gray-10);
    --ui-button-hover-bg: var(--gray-8);
    --ui-button-color: white;
  }
  #action-button-replace.is-replacing {
    --ui-button-bg: var(--lime-5);
    --ui-button-hover-bg: var(--lime-6);
    --ui-button-color: var(--text-on-primary);
  }
}
</style>
