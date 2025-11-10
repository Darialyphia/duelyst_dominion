<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent
} from 'reka-ui';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { useCollectionPage } from './useCollectionPage';

const { deckBuilder } = useCollectionPage();
</script>

<template>
  <div class="overflow-y-auto fancy-scrollbar flex flex-col">
    <ul>
      <HoverCardRoot
        :open-delay="100"
        :close-delay="0"
        v-for="(card, index) in deckBuilder.cards"
        :key="index"
      >
        <HoverCardTrigger class="inspectable-card" v-bind="$attrs" as-child>
          <li
            :style="{
              '--bg': `url(/assets/cards/${card.blueprint.cardIconId}.png)`
            }"
            :class="card.blueprint.kind.toLocaleLowerCase()"
            class="deck-item"
            @click="deckBuilder.removeCard(card.meta!.cardId)"
          >
            <div
              class="mana-cost"
              :style="{ opacity: 'manaCost' in card.blueprint ? 1 : 0 }"
            >
              <span v-if="'manaCost' in card.blueprint">
                {{ card.blueprint.manaCost }}
              </span>
            </div>
            <div
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
            <BlueprintCard
              :blueprint="card.blueprint"
              style="--pixel-scale: 1.5"
            />
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </ul>
  </div>
</template>

<style scoped lang="postcss">
.deck-item {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  border: solid var(--border-size-1) #bba08377;
  padding: var(--size-2) var(--size-2);
  cursor: url('/assets/ui/cursor-hover.png'), auto;
  background-image:
    linear-gradient(to right, hsl(0deg 0% 20% / 0.5), hsl(0deg 0% 0% / 0.5)),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    calc(100% + 40px) -104px;
  background-size: 200%, calc(2px * 96);
  transition: transform 0.3s var(--ease-2);
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

  @starting-style {
    opacity: 0;
    transform: translateX(-3rem);
  }
}

.mana-cost {
  background: url(/assets/ui/mana-cost.png) no-repeat center center;
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
    background: url(/assets/ui/rune-red.png) no-repeat center center;
  }
  &.yellow {
    background: url(/assets/ui/rune-yellow.png) no-repeat center center;
  }
  &.blue {
    background: url(/assets/ui/rune-blue.png) no-repeat center center;
  }
}
</style>
