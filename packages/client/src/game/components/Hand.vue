<script setup lang="ts">
import {
  useFxEvent,
  useGameClient,
  useGameUi,
  useMyPlayer,
  usePlayer
} from '@/game/composables/useGameClient';
import GameCard from '@/game/components/GameCard.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { clamp } from '@game/shared';
import { OnClickOutside } from '@vueuse/components';
import { useResizeObserver } from '@vueuse/core';
import type { ShallowRef } from 'vue';

const { playerId } = defineProps<{ playerId: string }>();

const player = usePlayer(playerId);
const ui = useGameUi();
const { client } = useGameClient();

const myPlayer = useMyPlayer();

const isExpanded = computed({
  get() {
    return playerId === myPlayer.value?.id
      ? ui.value.isHandExpanded
      : ui.value.isOpponentHandExpanded;
  },
  set(v) {
    if (playerId === myPlayer.value?.id) {
      ui.value.isHandExpanded = v;
    } else {
      ui.value.isOpponentHandExpanded = v;
    }
  }
});

const isMyHand = computed(() => {
  return playerId === myPlayer.value?.id;
});

onMounted(() => {
  if (!isMyHand.value) return;
  if (playerId === client.value.getActivePlayerId()) {
    isExpanded.value = true;
  }
});

useFxEvent(FX_EVENTS.CARD_ADD_TO_HAND, async () => {
  // const newCard = e.card as SerializedCard;
  // if (newCard.player !== board.value.playerId) return;
  // // @FIXME this can happen on P1T1, this will probaly go away once mulligan is implemented
  // if (board.value.hand.includes(newCard.id)) return;
  // if (isDefined(e.index)) {
  //   board.value.hand.splice(e.index, 0, newCard.id);
  // } else {
  //   board.value.hand.push(newCard.id);
  // }
  // await nextTick();
  // const el = ui.value.DOMSelectors.cardInHand(
  //   newCard.id,
  //   board.value.playerId
  // ).element;
  // if (el) {
  //   await el.animate(
  //     [
  //       { transform: 'translateY(-50%)', opacity: 0 },
  //       { transform: 'none', opacity: 1 }
  //     ],
  //     {
  //       duration: 300,
  //       easing: 'ease-out'
  //     }
  //   ).finished;
  // }
});

const handContainer = useTemplateRef('hand') as Readonly<
  ShallowRef<HTMLElement | null>
>; // somehow we have to cast it because it makes vue-tsc fail, yet it works in IDE...

const handContainerSize = ref({ w: 0, h: 0 });
const handOffsetY = ref(0);
useResizeObserver(handContainer, async () => {
  await nextTick();
  const el = handContainer.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  handContainerSize.value = { w: rect.width, h: rect.height };

  handOffsetY.value = handContainer.value.clientHeight;
});

const pixelScale = computed(() => {
  let el = handContainer.value;
  if (!el) return 1;
  let scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  while (!scale) {
    if (!el.parentElement) return 1;
    el = el.parentElement;
    scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  }

  return parseInt(scale) || 1;
});

const cardW = computed(() => {
  return (
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--card-width-unitless'
      )
    ) * pixelScale.value
  );
});

const handSize = computed(() => player.value.hand.length);

const MAX_FAN_ANGLE = 15;
const MAX_FAN_SAG = 150;

const tOf = (i: number, n: number) => {
  // map i=0..n-1 to t in [-1, 1]
  const half = (n - 1) / 2;
  return n <= 1 ? 0 : (i - half) / Math.max(half, 1);
};
const overlapRatio = computed(() => {
  if (handSize.value <= 1) return 0;
  const r = (cardW.value - step.value) / cardW.value; // 0..1
  return clamp(r, 0.3, 1);
});

const fanSag = computed(() => overlapRatio.value * MAX_FAN_SAG);

const rotDeg = (i: number) => tOf(i, handSize.value) * (MAX_FAN_ANGLE / 2);

const yOffset = (i: number) => {
  const t = tOf(i, handSize.value);
  return fanSag.value * t * t;
};

const step = computed(() => {
  if (handSize.value <= 1) return 0;
  const natural =
    (handContainerSize.value.w - cardW.value) / (handSize.value - 1);
  return clamp(natural, 0, cardW.value);
});

const cards = computed(() => {
  if (handSize.value === 0) return [];
  const usedSpan = cardW.value + (handSize.value - 1) * step.value;
  const offset = (handContainerSize.value.w - usedSpan) / 2;

  return player.value.hand.map((card, i) => ({
    card,
    x: offset + i * step.value,
    y: yOffset(i),
    rot: rotDeg(i),
    z: i
  }));
});
</script>

<template>
  <OnClickOutside
    :options="{ ignore: [`${ui.DOMSelectors.globalActionButtons.selector} *`] }"
    @trigger="isExpanded = false"
  >
    <section
      :id="`hand-${player.id}`"
      class="hand"
      :class="{
        'ui-hidden': !ui.displayedElements.hand,
        expanded: isExpanded,
        'opponent-hand': !isMyHand
      }"
      :style="{
        '--hand-size': player.hand.length,
        '--hand-offset-y': handOffsetY
      }"
      ref="hand"
    >
      <div
        class="hand-card"
        v-for="(card, index) in cards"
        :key="card.card.id"
        :class="{
          selected: ui.selectedCard?.equals(card.card),
          disabled: !card.card.canPlay
        }"
        :data-keyboard-shortcut="isMyHand && isExpanded ? index + 1 : undefined"
        data-keyboard-shortcut-centered="true"
        :style="{
          '--x': `${card.x}px`,
          '--y': `${card.y}px`,
          '--z': card.z,
          '--keyboard-shortcut-right': '50%'
        }"
        @click="isExpanded = true"
      >
        <GameCard
          :card-id="card.card.id"
          actions-side="top"
          :actions-offset="15"
          :is-interactive="isExpanded && isMyHand"
          show-disabled-message
          style="--pixel-scale: 1.5"
        />
      </div>
    </section>
  </OnClickOutside>
</template>

<style scoped lang="postcss">
.hand {
  --pixel-scale: 2;
  position: relative;
  z-index: 1;
  height: 100%;
  width: 100%;
  &.opponent-hand:not(.expanded) {
    position: absolute;
    right: 0;
  }
  /* background-color: blue; */
  &.expanded {
    left: 50%;
    width: 100%;
    transform: translateX(-50%);
    z-index: 2;
  }
}

.hand-card {
  position: absolute;
  left: 0;

  --hover-offset: 30px;
  --offset-y: var(--hover-offset);
  --rot-scale: 0;
  --_y: var(--offset-y);
  transform-origin: 50% 100%;
  transform: translateX(var(--x)) translateY(var(--_y));

  z-index: var(--z);
  transition: transform 0.2s var(--ease-2);
  pointer-events: auto;

  .hand.expanded & {
    --rot-scale: 1;
    --_y: calc(var(--y) + var(--offset-y));
    --offset-y: calc(var(--hover-offset) - 1px * var(--hand-offset-y));
  }

  &:hover {
    --hover-offset: -180px;
    z-index: var(--hand-size);
  }
  .hand.expanded &:hover,
  &.selected {
    --hover-offset: -20px;
    --rot-scale: 0;
    --_y: var(--offset-y);
  }
  &.disabled {
    filter: brightness(0.75) grayscale(0.3);
  }
}
</style>
