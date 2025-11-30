<script setup lang="ts">
import { useSprite } from '@/card/composables/useSprite';
import { CARD_KINDS, type Rune } from '@game/engine/src/card/card.enums';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { defaultConfig } from '@game/engine/src/config';
import {
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger
} from 'reka-ui';
import sprites from 'virtual:sprites';

export type DisplayedDeck = {
  name: string;
  cards: { blueprintId: string; copies: number }[];
};
const { deck } = defineProps<{
  deck: DisplayedDeck;
}>();

const general = computed(() => {
  const card = deck.cards.find(
    card => CARDS_DICTIONARY[card.blueprintId].kind === CARD_KINDS.GENERAL
  )!;
  if (!card) return null;
  return CARDS_DICTIONARY[card.blueprintId];
});

const cards = computed(() =>
  deck.cards.map(card => ({
    ...card,
    blueprint: CARDS_DICTIONARY[card.blueprintId]
  }))
);

const minions = computed(() =>
  cards.value.filter(item => item.blueprint.kind === CARD_KINDS.MINION)
);

const spells = computed(() =>
  cards.value.filter(item => item.blueprint.kind === CARD_KINDS.SPELL)
);

const artifacts = computed(() =>
  cards.value.filter(item => item.blueprint.kind === CARD_KINDS.ARTIFACT)
);
const highestRuneCost = computed<Record<Rune, number>>(() => {
  const runeCosts: Record<Rune, number> = {
    red: 0,
    yellow: 0,
    blue: 0
  };

  for (const item of cards.value) {
    if (!('runeCost' in item.blueprint)) continue;
    for (const [rune, cost] of Object.entries(item.blueprint.runeCost)) {
      const runeKey = rune as Rune;
      if (cost > runeCosts[runeKey]) {
        runeCosts[runeKey] = cost;
      }
    }
  }

  return runeCosts;
});

const sprite = computed(() =>
  general.value ? sprites[general.value.sprite.id] : null
);
const { activeFrameRect, bgPosition, imageBg } = useSprite({
  kind: CARD_KINDS.GENERAL,
  sprite: sprite,
  animationSequence: undefined
});
</script>

<template>
  <div>
    <HoverCardRoot>
      <HoverCardTrigger as-child>
        <button class="player-deck">
          <div
            class="general"
            :style="{
              '--bg-position': bgPosition,
              '--width': `${activeFrameRect.width}px`,
              '--height': `${activeFrameRect.height}px`,
              '--background-width': `calc( ${sprite?.sheetSize.w}px * var(--pixel-scale))`,
              '--background-height': `calc(${sprite?.sheetSize.h}px * var(--pixel-scale))`
            }"
          />
          <div class="deck-name">
            {{ deck.name }}
          </div>

          <div class="flex gap-1" v-if="defaultConfig.FEATURES.RUNES">
            <div class="rune-count">
              <img src="/assets/ui/rune-red.png" />
              {{ highestRuneCost.red }}
            </div>

            <div class="rune-count">
              <img src="/assets/ui/rune-yellow.png" />
              {{ highestRuneCost.yellow }}
            </div>
            <div class="rune-count">
              <img src="/assets/ui/rune-blue.png" />
              {{ highestRuneCost.blue }}
            </div>
          </div>
        </button>
      </HoverCardTrigger>

      <HoverCardPortal>
        <HoverCardContent side="left" align="center" :side-offset="8">
          <div class="deck-details">
            <ul>
              <li v-for="item in minions" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
              <li v-for="item in spells" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
              <li v-for="item in artifacts" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
            </ul>
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
  </div>
</template>

<style scoped lang="postcss">
.player-deck {
  --pixel-scale: 1;
  display: flex;
  width: 100%;
  gap: var(--size-2);
  align-items: center;
  position: relative;
  overflow: hidden;

  /* background-image:
    linear-gradient(to right, hsl(0deg 0% 20% / 0.5), hsl(0deg 0% 0% / 0.5)),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    right calc(100% + 50px);
  background-size: 200%, calc(2px * 96); */
  padding: var(--size-2) var(--size-4);
  border: solid 1px hsl(var(--color-primary-hsl) / 0.5);
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.general {
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
}

.deck-name {
  position: relative;
  flex: 1 1 0%;
  text-align: left;
  align-self: stretch;
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
  text-shadow: 0 0 1rem 1rem black;
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  @screen lt-lg {
    font-size: var(--font-size-1);
  }
}

.deck-details {
  padding: var(--size-4);
  --un-bg-opacity: 1;
  background-color: hsl(var(--gray-10-hsl) / var(--un-bg-opacity));
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-3);
  color: white;
}

.rare {
  color: var(--blue-4);
}

.epic {
  color: var(--purple-4);
}

.legendary {
  color: var(--orange-4);
}

.rune-count {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: var(--font-size-4);
  --pixel-scale: 1;
  font-weight: var(--font-weight-5);
  box-shadow: var(--shadow-4);
  filter: drop-shadow(0 0 0.5rem black);
  img {
    width: calc(17px * var(--pixel-scale));
    height: calc(21px * var(--pixel-scale));
  }
}
</style>
