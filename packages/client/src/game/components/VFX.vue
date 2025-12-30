<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent } from '../composables/useGameClient';
import VFXLights from './VFXLights.vue';
import VFXSprites from './VFXSprites.vue';
import MouseLight from './MouseLight.vue';

const isVfxOverlayDisplayed = ref(false);
useFxEvent(FX_EVENTS.CARD_BEFORE_PLAY, () => {
  isVfxOverlayDisplayed.value = true;
});
useFxEvent(FX_EVENTS.CARD_AFTER_PLAY, () => {
  isVfxOverlayDisplayed.value = false;
});
</script>

<template>
  <div id="lights-teleport" />
  <VFXLights />
  <VFXSprites />
  <MouseLight />

  <Transition appear>
    <div class="vfx-overlay" v-if="isVfxOverlayDisplayed" />
  </Transition>
</template>

<style scoped lang="postcss">
#lights-teleport {
  /* position: fixed; */
  top: 0;
  left: 0;
}

.vfx-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, transparent, black 75%);
  opacity: 0.45;
  pointer-events: none;
  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.5s;
  }
  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}
</style>
