<script setup lang="ts">
import { useCollectionPage } from './useCollectionPage';
import CardText from '@/card/components/CardText.vue';
const { deckBuilder } = useCollectionPage();

const getCount = (cards: Array<{ copies: number }>) => {
  return cards.reduce((acc, card) => {
    if ('copies' in card) {
      return acc + ((card.copies as number) ?? 1);
    }
    return acc + 1;
  }, 0);
};

const getCountForCost = (cost: number) =>
  getCount(
    deckBuilder.value.cards.filter(c => {
      if (!('manaCost' in c.blueprint)) return false;
      return c.blueprint.manaCost === cost;
    })
  );

const getCountForCostAndUp = (minCost: number) =>
  getCount(
    deckBuilder.value.cards.filter(c => {
      if (!('manaCost' in c.blueprint)) return false;
      return c.blueprint.manaCost >= minCost;
    })
  );

const bars = computed(() => {
  const result: Array<{ label: string; count: number }> = [];
  for (let i = 0; i < 6; i++) {
    result.push({ label: i.toString(), count: getCountForCost(i) });
  }
  result.push({ label: '6+', count: getCountForCostAndUp(6) });
  return result;
});
</script>

<template>
  <div class="bars lt-lg:hidden" :style="{ '--total': deckBuilder.deckSize }">
    <div
      v-for="bar in bars"
      :key="bar.label"
      :style="{
        '--count': bar.count
      }"
    >
      <div
        class="bar"
        :data-count="
          (bar.count * 10) % 10 === 0 ? bar.count : bar.count.toFixed(1)
        "
      />
      <div class="cost"><CardText :text="bar.label" /></div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.bars {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: var(--size-1);
  height: var(--size-10);
  margin-top: var(--size-2);

  > div {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: var(--size-1);
  }
}

.cost {
  display: grid;
  place-content: center;
  color: var(--primary);
}

.bar {
  --percent: calc(1% * (var(--count) * 100 / var(--total)));

  position: relative;
  background: linear-gradient(
    to top,
    var(--primary) 0%,
    var(--primary) var(--percent),
    hsl(var(--gray-12-hsl) / 0.5) var(--percent)
  );

  &:not([data-count='0'])::after {
    content: attr(data-count);

    position: absolute;
    bottom: var(--percent);
    left: 50%;
    transform: translateX(-50%);

    font-size: var(--font-size-0);
  }
}
</style>
