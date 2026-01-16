<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent } from '../composables/useGameClient';
import { waitFor } from '@game/shared';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

const phase = ref<string | null>(null);

useFxEvent(FX_EVENTS.BEFORE_CHANGE_PHASE, async event => {
  if (
    event.from === GAME_PHASES.PLAYING_CARD ||
    event.to === GAME_PHASES.PLAYING_CARD
  ) {
    return;
  }

  phase.value = event.to;
  await waitFor(1500);
  phase.value = null;
});
</script>

<template>
  <div class="game-phase-indicator" v-if="phase">
    {{ phase }}
  </div>
</template>

<style scoped lang="postcss">
.game-phase-indicator {
  position: fixed;
  inset: 0;
  display: grid;
  place-content: center;
}
</style>
