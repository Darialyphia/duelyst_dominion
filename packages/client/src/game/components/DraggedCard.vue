<script setup lang="ts">
import { isDefined, lerp } from '@game/shared';
import { useMouse, useRafFn } from '@vueuse/core';
import {
  useGameUi,
  useGameState,
  useGameClient
} from '../composables/useGameClient';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { Flip } from 'gsap/Flip';
import UiButton from '@/ui/components/UiButton.vue';
const cardRotation = ref({ x: 0, y: 0 });
const { x, y } = useMouse();
let prev = { x: x.value, y: y.value };
let delta = { x: 0, y: 0 };
const MAX_ANGLE = 45;
const SCALE_FACTOR = 1.4;
const LERP_FACTOR = 0.3;

const rotationAnimation = useRafFn(() => {
  delta = {
    x: x.value - prev.x,
    y: y.value - prev.y
  };

  prev = { x: x.value, y: y.value };

  cardRotation.value = {
    x: lerp(
      cardRotation.value.x,
      Math.round(
        Math.max(Math.min(delta.y * SCALE_FACTOR, MAX_ANGLE), -MAX_ANGLE) * -1
      ),
      LERP_FACTOR
    ),
    y: lerp(
      cardRotation.value.y,
      Math.round(
        Math.max(Math.min(delta.x * SCALE_FACTOR, MAX_ANGLE), -MAX_ANGLE)
      ),
      LERP_FACTOR
    )
  };
});

const ui = useGameUi();
const state = useGameState();
const isPinned = ref(false);
const isPinning = ref(false);
const { client } = useGameClient();

const container = useTemplateRef<HTMLDivElement>('container');
watchEffect(() => {
  const shouldPin =
    state.value.phase.state !== GAME_PHASES.PLAYING_CARD ||
    !isDefined(ui.value.selectedCard);
  if (shouldPin === isPinned.value) return;

  if (shouldPin) {
    if (!container.value) return;

    const flipState = Flip.getState(container.value);
    isPinning.value = true;
    isPinned.value = shouldPin;
    window.requestAnimationFrame(() => {
      Flip.from(flipState, {
        targets: container.value,
        duration: 0.25,
        absolute: true,
        ease: Power1.easeOut,
        onComplete() {
          isPinning.value = false;
        }
      });
    });
  } else {
    isPinned.value = shouldPin;
  }
});

watch(isPinned, pinned => {
  if (pinned) {
    rotationAnimation.pause();
  } else {
    rotationAnimation.resume();
  }
});
</script>

<template>
  <Teleport to="#dragged-card-container" defer>
    <div
      ref="container"
      id="dragged-card"
      data-flip-id="dragged-card"
      :class="{
        'is-pinned': isPinned,
        'is-pinning': isPinning
      }"
      :style="{
        '--x': `${x}px`,
        '--y': `${y}px`
      }"
    >
      <slot />
      <Transition>
        <div
          v-if="
            isPinned &&
            !isPinning &&
            state.phase.state === GAME_PHASES.PLAYING_CARD
          "
          class="flex flex-col gap-3 mt-3"
          @mouseup.stop
        >
          <UiButton
            class="primary-button w-full pointer-events-auto"
            @click="client.commitSpaceSelection()"
          >
            Confirm
          </UiButton>
          <UiButton
            class="error-button w-full pointer-events-auto"
            @click="client.cancelPlayCard()"
          >
            Cancel
          </UiButton>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style lang="postcss" scoped>
#dragged-card {
  pointer-events: none !important;
  position: fixed;
  z-index: 99;
  transform-style: preserve-3d;
  transform-origin: center center;

  &:not(.is-pinned) {
    top: 0;
    left: 0;
    transform: translateY(var(--y)) translateX(var(--x))
      rotateX(calc(1deg * v-bind('cardRotation.x')))
      rotateY(calc(1deg * v-bind('cardRotation.y')));
  }
  &.is-pinned {
    top: var(--size-13);
    right: var(--size-8);
  }
}

.v-enter-active {
  transition:
    opacity 0.2s var(--ease-in-2),
    transform 0.2s var(--ease-in-2);
}

.v-enter-from {
  opacity: 0;
  transform: translateX(2rem);
}
</style>
