<script setup lang="ts">
import type { DeckBuilderCardMeta } from '@/card/deck-builder.model';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { useCollectionPage } from './useCollectionPage';
import { defaultConfig } from '@game/engine/src/config';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { useSprite } from '@/card/composables/useSprite';
import { sprites } from '@/assets';
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent
} from 'reka-ui';
import BlueprintCard from '@/card/components/BlueprintCard.vue';

const { card } = defineProps<{
  card: {
    blueprint: CardBlueprint;
    copies: number;
    blueprintId: string;
    meta: DeckBuilderCardMeta;
  };
}>();

const { deckBuilder } = useCollectionPage();

const sprite = computed(() => sprites[`cards/${card.blueprint.vfx.spriteId}`]);

const { activeFrameRect, bgPosition, imageBg } = useSprite({
  kind: CARD_KINDS.GENERAL,
  sprite: sprite,
  animationSequence: undefined
});
</script>

<template>
  <HoverCardRoot :open-delay="100" :close-delay="0">
    <HoverCardTrigger class="inspectable-card" v-bind="$attrs" as-child>
      <li
        :class="[
          card.blueprint.kind.toLocaleLowerCase(),
          card.copies === 1 && 'first-copy'
        ]"
        class="deck-item"
        :key="`${card.blueprintId}_${card.copies}`"
        @click="deckBuilder.removeCard(card.meta!.cardId)"
      >
        <div
          class="sprite"
          :style="{
            '--bg-position': bgPosition,
            '--width': `${activeFrameRect.width}px`,
            '--height': `${activeFrameRect.height}px`,
            '--background-width': `calc( ${sprite?.sheetSize.w}px * var(--pixel-scale))`,
            '--background-height': `calc(${sprite?.sheetSize.h}px * var(--pixel-scale))`
          }"
        />
        <div
          class="mana-cost"
          :style="{ opacity: 'manaCost' in card.blueprint ? 1 : 0 }"
        >
          <span v-if="'manaCost' in card.blueprint">
            {{ card.blueprint.manaCost }}
          </span>
        </div>
        <div
          v-if="defaultConfig.FEATURES.RUNES"
          class="runes"
          :style="{ opacity: 'runeCost' in card.blueprint ? 1 : 0 }"
        >
          <div class="rune red">
            <span v-if="'runeCost' in card.blueprint">
              {{ card.blueprint.runeCost.red || '' }}
            </span>
          </div>
          <div class="rune yellow">
            <span v-if="'runeCost' in card.blueprint">
              {{ card.blueprint.runeCost.yellow || '' }}
            </span>
          </div>
          <div class="rune blue">
            <span v-if="'runeCost' in card.blueprint">
              {{ card.blueprint.runeCost.blue || '' }}
            </span>
          </div>
        </div>
        <span class="card-name">
          <template v-if="'copies' in card">X {{ card.copies }}</template>
          {{ card.blueprint.name }}
        </span>
      </li>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent side="left" :side-offset="10">
        <BlueprintCard :blueprint="card.blueprint" style="--pixel-scale: 1.5" />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style lang="postcss" scoped>
.deck-item {
  overflow: hidden;
  position: relative;
  display: flex;
  gap: var(--size-2);
  align-items: center;
  border: solid var(--border-size-1) #bba08377;
  padding: var(--size-2) var(--size-2);
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
  background-image: linear-gradient(
    to right,
    hsl(0deg 0% 20% / 0.5),
    hsl(0deg 0% 0% / 0.5)
  );
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 200%;
  transition:
    transform 0.3s var(--ease-2),
    opacity 0.3s var(--ease-2),
    filter 0.3s var(--ease-2);
  &:first-of-type {
    border-top-left-radius: var(--radius-2);
    border-top-right-radius: var(--radius-2);
  }
  &:last-of-type {
    border-bottom-left-radius: var(--radius-2);
    border-bottom-right-radius: var(--radius-2);
  }

  &.artifact,
  &.spell {
    background-position:
      center center,
      calc(100% + 50px) -124px;
  }

  &.first-copy {
    @starting-style {
      opacity: 0;
      transform: translateX(-3rem);
    }
  }
  &:not(.first-copy) {
    @starting-style {
      filter: brightness(3);
    }
  }
}

.mana-cost {
  background: url(@/assets/ui/mana-cost.png) no-repeat center center;
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: calc(22px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  padding-right: 1px;
}

.card-name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  position: relative;
  z-index: 1;
}

.runes {
  display: flex;
  gap: var(--size-1);
}

.rune {
  background-size: contain;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: 17px;
  height: 21px;
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;

  &.red {
    background: url(@/assets/ui/rune-red.png) no-repeat center center;
  }
  &.yellow {
    background: url(@/assets/ui/rune-yellow.png) no-repeat center center;
  }
  &.blue {
    background: url(@/assets/ui/rune-blue.png) no-repeat center center;
  }
}

.sprite {
  --pixel-scale: 1;
  position: absolute;
  bottom: -1rem;
  scale: -2 2;
  right: 0;
  width: var(--width);
  height: var(--height);
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  opacity: 0.35;

  :where(.artifact, .spell) & {
    translate: -15px -20px;
  }
}
</style>
