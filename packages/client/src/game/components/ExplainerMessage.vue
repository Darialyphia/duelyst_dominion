<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';

const ui = useGameUi();
</script>

<template>
  <p
    class="explainer-message"
    :class="{
      displayed: !!ui.explainerMessage
    }"
  >
    {{ ui.explainerMessage || '' }}
  </p>
</template>

<style scoped lang="postcss">
.explainer-message {
  font-size: var(--font-size-3);
  color: #dec6a6;
  letter-spacing: 0.25ch;
  opacity: 0;
  text-align: center;
  padding-block: var(--size-3);
  text-wrap: balance;
  &.displayed {
    opacity: 1;
  }
}
</style>
