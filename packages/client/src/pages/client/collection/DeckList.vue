<script setup lang="ts">
import PlayerDeck from '@/player/components/PlayerDeck.vue';
import { useCollectionPage } from './useCollectionPage';
import FancyButton from '@/ui/components/FancyButton.vue';

const { decks, createDeck, editDeck } = useCollectionPage();
</script>

<template>
  <p v-if="!decks" class="text-center text-4 mt-6">Loading...</p>
  <p v-else-if="!decks.length" class="text-center text-4 mt-6">
    You haven't created any deck.
  </p>
  <template v-else>
    <ul class="mb-5">
      <li v-for="(deck, index) in decks" :key="index">
        <PlayerDeck :deck="deck" @click="editDeck(deck.id)" />
      </li>
    </ul>
  </template>
  <FancyButton
    v-if="decks"
    class="primary-button"
    :class="!decks.length && ['mx-auto mt-4']"
    text="New Deck"
    @click="createDeck"
  />
</template>
