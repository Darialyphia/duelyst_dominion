<script setup lang="ts">
import { useSandbox } from '../composables/useSandbox';
import FancyButton from '@/ui/components/FancyButton.vue';
import GameBoard from '@/game/components/GameBoard.vue';
import SandboxTools from './SandboxTools.vue';

const { players } = defineProps<{
  players: Parameters<typeof useSandbox>[0]['players'];
}>();

const sandbox = useSandbox({
  rngSeed: `sandbox-${Math.random().toString(36).substring(2, 15)}`,
  players
});
</script>

<template>
  <GameBoard v-if="sandbox.client.value.isReady">
    <template #menu>
      <RouterLink
        custom
        v-slot="{ navigate, href }"
        :to="{ name: 'ClientHome' }"
      >
        <FancyButton
          text="Quit"
          class="w-full"
          :href="href"
          variant="error"
          @click="navigate"
        />
      </RouterLink>
    </template>
  </GameBoard>
  <SandboxTools
    v-model:auto-switch="sandbox.autoSwitchPlayer.value"
    v-model:player-id="sandbox.playerId.value"
    :players="players"
    :history="sandbox.client.value.history"
    @rewindOneStep="sandbox.rewindOneStep"
    @rewindTo="sandbox.rewindTo"
    @restart="sandbox.restart"
    @refillMana="sandbox.refillMana"
    @addRune="sandbox.addRune"
    @addToHand="sandbox.addCardToHand"
    @setMaxMana="sandbox.setMaxMana"
    @move="sandbox.moveUnit"
    @activate-unit="sandbox.activateUnit"
  />
</template>

<style scoped lang="postcss"></style>
