<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import DeckCard from './DeckCard.vue';

const { deckBuilder } = useCollectionPage();
</script>

<template>
  <div class="overflow-y-auto fancy-scrollbar flex flex-col">
    <ul>
      <DeckCard
        v-for="(card, index) in deckBuilder.cards"
        :key="index"
        :card="card"
      />
    </ul>
  </div>
</template>
