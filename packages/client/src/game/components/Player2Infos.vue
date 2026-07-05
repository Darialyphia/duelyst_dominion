<script setup lang="ts">
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useGameUi,
  useOpponentPlayer
} from '../composables/useGameClient';
import EquipedArtifact from './EquipedArtifact.vue';
import DiscardPile from './DiscardPile.vue';
import { Icon } from '@iconify/vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

const player = useOpponentPlayer();
const { playerId } = useGameClient();
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

const ui = useGameUi();
</script>

<template>
  <div class="p2-infos">
    <header
      :class="{ active: state.turnPlayer === player.id }"
      :id="ui.DOMSelectors.playerInfos(player.id).id"
    >
      <div class="flex flex-col gap-2 items-end w-full">
        <div class="flex gap-5 items-center justify-between">
          {{ player.name }}
          <div class="hp">
            {{ player.currentHp }}
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
      class="flex gap-2 justify-end items-center"
      :id="ui.DOMSelectors.mana(player.id).id"
    >
      (+ {{ player.manaRegen }} )
      <div
        v-for="i in Math.max(player.maxMana, player.mana)"
        :key="i"
        class="mana"
        :class="{ spent: i <= player.spentMana }"
      />
    </div>

    <div class="flex gap-2 justify-end mt-2">
      <div class="rune might">
        <span class="dual-text" :data-text="player.runes.might">
          {{ player.runes.might }}
        </span>
      </div>
      <div class="rune wisdom">
        <span class="dual-text" :data-text="player.runes.wisdom">
          {{ player.runes.wisdom }}
        </span>
      </div>
      <div class="rune focus">
        <span class="dual-text" :data-text="player.runes.focus">
          {{ player.runes.focus }}
        </span>
      </div>
      <div class="rune resonance">
        <span class="dual-text" :data-text="player.runes.resonance">
          {{ player.runes.resonance }}
        </span>
      </div>
    </div>

    <div class="flex flex-col items-end gap-2">
      <EquipedArtifact
        v-for="artifact in player.artifacts"
        :key="artifact.id"
        :artifact="artifact"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.p2-infos {
  position: fixed;
  top: min(var(--size-9), 5vh);
  right: min(var(--size-13), 8vw);
  color: white;
  font-weight: bold;
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
  min-width: 24ch;
  font-size: var(--font-size-4);
  display: grid;
  align-self: end;
  grid-gap: var(--size-2);
  justify-items: end;
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

.rune {
  background-position: top center;
  background-size: 29px 30px;
  background-repeat: no-repeat;
  padding-top: 32px;
  min-width: 29px;
  text-align: center;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-7);
  position: relative;
  z-index: 0;
  --dual-text-stroke-offset-y: -3px;
  &.might {
    background-image: url('@/assets/ui/card/rune-might-large.png');
  }
  &.wisdom {
    background-image: url('@/assets/ui/card/rune-wisdom-large.png');
  }
  &.focus {
    background-image: url('@/assets/ui/card/rune-focus-large.png');
  }
  &.resonance {
    background-image: url('@/assets/ui/card/rune-resonance-large.png');
  }
}
</style>
