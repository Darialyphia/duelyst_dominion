<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {
  CARD_KINDS,
  FACTIONS,
  type CardKind,
  type Faction
} from '@game/engine/src/card/card.enums';
import { uppercaseFirstLetter } from '@game/shared';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { useCollectionPage } from './useCollectionPage';

const {
  textFilter,
  hasKindFilter,
  toggleKindFilter,
  hasFactionFilter,
  toggleFactionFilter,
  clearFactionFilter,
  viewMode
} = useCollectionPage();

const cardKinds: Array<{
  id: CardKind;
  img: string;
  label: string;
  color: string;
}> = Object.values(CARD_KINDS).map(kind => ({
  id: kind,
  img: `/assets/ui/card-kind-${kind.toLocaleLowerCase()}.png`,
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
  img: `/assets/ui/crest-${faction.toLocaleLowerCase()}.png`,
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
    <section class="flex gap-3 items-center">
      <h4>Display</h4>
      <UiSimpleTooltip>
        <template #trigger>
          <label class="view-toggle">
            <Icon icon="material-symbols-light:view-column-2" width="1.5rem" />
            <input
              v-model="viewMode"
              type="radio"
              value="expanded"
              class="sr-only"
            />
          </label>
        </template>
        Normal view
      </UiSimpleTooltip>

      <UiSimpleTooltip>
        <template #trigger>
          <label class="view-toggle">
            <Icon icon="heroicons:squares-2x2-16-solid" width="1.5rem" />
            <input
              v-model="viewMode"
              type="radio"
              value="compact"
              class="sr-only"
            />
          </label>
        </template>
        Compact view
      </UiSimpleTooltip>
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
  cursor: url('/assets/ui/cursor-hover.png'), auto;
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
</style>
