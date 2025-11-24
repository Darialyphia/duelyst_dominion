<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent
} from 'reka-ui';
import { useCollectionPage } from './useCollectionPage';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import type { CardId } from '@game/api';

const { deckBuilder, isEditingDeck, viewMode } = useCollectionPage();

const { card } = defineProps<{
  card: {
    card: CardBlueprint;
    id: string;
    isFoil: boolean;
    copiesOwned: number;
  };
}>();

const isPreviewOpened = ref(false);

const canAddCard = computed(() => {
  if (!isEditingDeck.value) return false;

  return (
    deckBuilder.value.canAdd({
      blueprintId: card.card.id,
      copies: card.copiesOwned,
      meta: {
        cardId: card.id as CardId,
        isFoil: card.isFoil
      }
    }) &&
    card.copiesOwned > (deckBuilder.value.getCard(card.card.id)?.copies ?? 0)
  );
});
</script>

<template>
  <HoverCardRoot
    :open-delay="250"
    :close-delay="0"
    :open="viewMode === 'expanded' ? false : isPreviewOpened"
    @update:open="isPreviewOpened = $event"
  >
    <HoverCardTrigger class="inspectable-card" v-bind="$attrs">
      <div>
        <BlueprintCard
          :blueprint="card.card"
          :is-tiltable="
            viewMode === 'expanded' && (!isEditingDeck || canAddCard)
          "
          show-stats
          class="collection-card"
          :parallax-multiplier="viewMode === 'compact' ? 0.4 : 1"
          :is-foil="card.isFoil"
          :class="{
            disabled: isEditingDeck && !canAddCard
          }"
          @click="
            () => {
              if (!isEditingDeck) return;
              if (!canAddCard) return;

              deckBuilder.addCard({
                blueprintId: card.card.id,
                meta: {
                  cardId: card.id as CardId,
                  isFoil: card.isFoil
                }
              });
            }
          "
          @contextmenu.prevent="
            () => {
              if (!isEditingDeck) return;
              if (deckBuilder.hasCard(card.id)) {
                deckBuilder.removeCard(card.id);
              }
            }
          "
        />

        <div
          class="text-center text-xs text-yellow-50/90 select-none pointer-events-none py-2"
        >
          X{{ card.copiesOwned }}
        </div>
      </div>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent v-if="viewMode === 'compact'" class="compact-details">
        <div>
          <BlueprintCard :blueprint="card.card" style="--pixel-scale: 1.5" />
        </div>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.collection-card {
  --transition-duration: 0.7s;

  /* &:is(.v-enter-active, .v-leave-active) {
    transition: all var(--transition-duration) var(--ease-spring-3);
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(15px);
    opacity: 0.5;
  } */
}

.collection-card.disabled {
  filter: grayscale(70%) brightness(80%);
}

.collection-card:not(.disabled):hover {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}

:deep(.compact-details) {
  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
:deep(.compact-details[data-side='top']) {
  animation-name: slideUp;
}
:deep(.compact-details[data-side='bottom']) {
  animation-name: slideDown;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
