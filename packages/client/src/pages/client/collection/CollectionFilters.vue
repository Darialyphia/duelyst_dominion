<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {
  CARD_KINDS,
  FACTIONS,
  type CardKind,
  type Faction
} from '@game/engine/src/card/card.enums';
import { uppercaseFirstLetter } from '@game/shared';
import { useCollectionPage } from './useCollectionPage';
import { assets } from '@/assets';
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui';
import UiSwitch from '@/ui/components/UiSwitch.vue';

const {
  textFilter,
  hasKindFilter,
  toggleKindFilter,
  hasFactionFilter,
  toggleFactionFilter,
  clearFactionFilter,
  cardScale,
  includeUnowned
} = useCollectionPage();

const cardKinds: Array<{
  id: CardKind;
  img: string;
  label: string;
  color: string;
}> = Object.values(CARD_KINDS).map(kind => ({
  id: kind,
  img: assets[`ui/card-kind-${kind.toLocaleLowerCase()}`].path,
  label: uppercaseFirstLetter(kind),
  color: '#dec7a6'
}));

const factions: Array<{
  id: Faction;
  img: string;
  label: string;
  color: string;
}> = Object.values(FACTIONS).map(faction => ({
  id: faction,
  img: assets[`ui/crest-${faction.toLocaleLowerCase()}`].path,
  label: uppercaseFirstLetter(faction),
  color: 'white'
}));
</script>

<template>
  <aside class="flex flex-col gap-3 surface">
    <section class="flex gap-3 items-center">
      <input
        v-model="textFilter"
        type="text"
        placeholder="Search cards..."
        class="search-input"
      />
    </section>
    <section class="flex gap-3 flex-col">
      <h4>Display</h4>
      <div class="flex">
        <Icon icon="material-symbols:zoom-in" width="1.5rem" />
        <SliderRoot
          v-model="cardScale"
          :min="0.5"
          :max="2"
          :step="0.25"
          class="card-scale"
        >
          <SliderTrack class="card-scale-track">
            <SliderRange class="card-scale-range" />
          </SliderTrack>
          <SliderThumb class="card-scale-thumb" />
        </SliderRoot>
      </div>
      <div class="filter-title flex gap-3 items-center">
        <UiSwitch v-model="includeUnowned" />
        Show unowned cards
      </div>
    </section>

    <section>
      <h4 class="flex items-center">
        Faction

        <button
          v-if="Object.values(FACTIONS).some(f => hasFactionFilter(f))"
          @click="clearFactionFilter()"
          class="active"
          aria-label="Clear faction filter"
        >
          <Icon icon="mdi:close" width="1.5rem" />
        </button>
      </h4>
      <div class="faction-filter">
        <button
          v-for="faction in factions"
          :key="faction.label"
          :class="hasFactionFilter(faction.id) && 'active'"
          :style="{ '--color': faction.color }"
          :aria-label="faction.label"
          @click="toggleFactionFilter(faction.id)"
        >
          <img :src="faction.img" :alt="faction.label" />
        </button>
      </div>
    </section>

    <section>
      <h4>Card type</h4>
      <div class="kind-filter">
        <button
          v-for="kind in cardKinds"
          :key="kind.label"
          :class="hasKindFilter(kind.id) && 'active'"
          :style="{ '--color': kind.color }"
          :aria-label="kind.label"
          @click="toggleKindFilter(kind.id)"
        >
          <img :src="kind.img" :alt="kind.label" />
          {{ kind.label }}
        </button>
      </div>
    </section>
  </aside>
</template>

<style scoped lang="postcss">
aside {
  width: 18rem;
}
.faction-filter {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  --pixel-scale: 2;

  button {
    border: solid var(--border-size-1) transparent;
    border-radius: var(--radius-pill);
    width: calc(var(--pixel-scale) * 39px);
    height: calc(var(--pixel-scale) * 38px);
    aspect-ratio: 1;
    padding: 0;
    display: grid;
    > img {
      width: 100%;
      height: 100%;
      transform: translateX(-0.5rem);
    }
    &:not(.active) {
      filter: brightness(75%);
    }
    &.active {
      filter: brightness(110%);
    }
  }
}

.kind-filter {
  display: flex;
  flex-direction: column;
  button {
    border: solid var(--border-size-1) transparent;
    border-radius: var(--radius-3);
    text-align: left;
    display: flex;
    gap: var(--size-2);
    align-items: center;

    &.active {
      background-color: hsl(from var(--color) h s l / 0.15);
      border-color: var(--color);
    }

    & > img {
      width: 32px;
      aspect-ratio: 1;
    }
  }
}

.view-toggle {
  cursor: url('@/assets/ui/cursor-hover.png'), auto;
}

.search-input {
  width: 100%;
  padding: var(--size-2) var(--size-4);
  border-radius: var(--radius-pill);
  border: solid var(--border-size-1) #b96b45;
  background-color: var(--color-gray-1);
  color: var(--color-gray-9);
  transition: border-color 0.2s var(--ease-1);
  &::placeholder {
    color: var(--color-gray-6);
    font-style: italic;
  }
  &:focus {
    border-color: #ffb270;
    outline: none;
  }
}

.card-scale {
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
  touch-action: none;
  width: 200px;
  height: 20px;
  z-index: 1;
}

.card-scale-track {
  background-color: var(--red-5);
  position: relative;
  flex-grow: 1;
  border-radius: var(--radius-pill);
  height: 3px;
}

.card-scale-range {
  position: absolute;
  background-color: white;
  border-radius: var(--radius-pill);
  height: 100%;
}

.card-scale-thumb {
  display: block;
  width: var(--size-4);
  height: var(--size-4);
  background-color: white;
  border-radius: var(--radius-3);
}
.card-scale-thumb:hover {
  background-color: var(--primary);
}
</style>
