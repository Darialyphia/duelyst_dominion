<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useMyPlayer } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { Icon } from '@iconify/vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const isOpened = ref(false);

const close = () => {
  isOpened.value = false;
};

const myPlayer = useMyPlayer();
</script>

<template>
  <UiSimpleTooltip>
    <template #trigger>
      <button class="toggle" @click="isOpened = true">
        <Icon icon="whh:grave" />
        ({{ player.discardPile.length }})
      </button>
    </template>
    {{ player.discardPile.length }} card{{}} in
    {{ myPlayer.id === player.id ? 'your' : "opponent's" }} discard pile
  </UiSimpleTooltip>

  <UiModal
    v-model:is-opened="isOpened"
    :title="
      myPlayer.id === player.id ? 'Your Discard Pile' : 'Opponent Discard Pile'
    "
    description=""
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="content" @click="close">
      <header>
        <h2 class="text-center">
          {{
            myPlayer.id === player.id
              ? 'Your Discard Pile'
              : 'Opponent Discard Pile'
          }}
        </h2>
      </header>
      <div class="card-list fancy-scrollbar" v-if="player.discardPile.length">
        <div
          v-for="card in player.getDiscardPile().toReversed()"
          :key="card.id"
          @click.stop
        >
          <GameCard :card-id="card.id" :actions-offset="10" />
        </div>
      </div>
      <p v-else class="text-center text-3 mt-10 italic">
        Discard Pile is empty.
      </p>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton text="Close" @click="isOpened = false" />
      </footer>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
.toggle {
  pointer-events: auto;
  display: flex;
  gap: var(--size-2);

  /*eslint-disable-next-line vue-scoped-css/no-unused-selector */
  svg {
    stroke: black;
    stroke-width: 4px;
  }
}
.content {
  --pixel-scale: 1.5;
  height: 80dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  &.is-showing-board .card-list {
    visibility: hidden;
  }
}

.card-list {
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: var(--size-3);
  justify-items: center;
  grid-auto-rows: min-content;
}

h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}
</style>
