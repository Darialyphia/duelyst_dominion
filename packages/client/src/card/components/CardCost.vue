<script setup lang="ts">
import { computed } from 'vue';
import { isDefined } from '@game/shared';
import type { RuneCost } from '@game/engine/src/card/card-blueprint';
import { defaultConfig } from '@game/engine/src/config';

const props = defineProps<{
  manaCost?: number | null;
  baseManaCost?: number | null;
  runeCost?: RuneCost;
}>();

const costStatus = computed(() => {
  if (isDefined(props.manaCost)) {
    if (!isDefined(props.baseManaCost) || props.baseManaCost === props.manaCost)
      return '';

    return props.manaCost < props.baseManaCost ? 'buffed' : 'debuffed';
  }

  return '';
});
</script>

<template>
  <div class="top-left parallax">
    <div v-if="isDefined(manaCost)" class="mana-cost" :class="costStatus">
      <span class="dual-text" :data-text="manaCost">
        {{ manaCost }}
      </span>
    </div>

    <template v-if="defaultConfig.FEATURES.RUNES && runeCost">
      <div class="rune red">
        <span
          v-if="isDefined(runeCost.red)"
          class="dual-text"
          :data-text="runeCost.red"
        >
          {{ runeCost.red }}
        </span>
      </div>
      <div class="rune yellow">
        <span
          v-if="isDefined(runeCost.yellow)"
          class="dual-text"
          :data-text="runeCost.yellow"
        >
          {{ runeCost.yellow }}
        </span>
      </div>
      <div class="rune blue">
        <span
          v-if="isDefined(runeCost.blue)"
          class="dual-text"
          :data-text="runeCost.blue"
        >
          {{ runeCost.blue }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped lang="postcss">
.top-left {
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  left: calc(2px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  gap: calc(4px * var(--pixel-scale));
}

.mana-cost {
  width: calc(29px * var(--pixel-scale));
  height: calc(32px * var(--pixel-scale));
  background: url('@/assets/ui/mana-cost.png');
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(14px * var(--pixel-scale));
  font-weight: bold;
  &.buffed {
    --top-color: #9eff9e;
    --bottom-color: #00cc00;
  }
  &.debuffed {
    --top-color: #ff9e9e;
    --bottom-color: #cc0000;
  }
}

.rune {
  width: calc(17px * var(--pixel-scale));
  height: calc(21px * var(--pixel-scale));
  background-size: cover;
  font-size: calc(14px * var(--pixel-scale));
  font-weight: bold;
  color: white;
  display: grid;
  place-items: center;
  --top-color: white;
  --bottom-color: #dec7a6;
  text-shadow: 0 3px 1rem black;
  &.red {
    background-image: url('@/assets/ui/rune-red.png');
  }
  &.yellow {
    background-image: url('@/assets/ui/rune-yellow.png');
  }
  &.blue {
    background-image: url('@/assets/ui/rune-blue.png');
  }
}

.dual-text {
  color: transparent;
  position: relative;
  --_top-color: var(--top-color, #dec7a6);
  --_bottom-color: var(--bottom-color, #bba083);
  &::before,
  &::after {
    position: absolute;
    content: attr(data-text);
    color: transparent;
    inset: 0;
  }
  &:after {
    background: linear-gradient(
      var(--_top-color),
      var(--_top-color) 50%,
      var(--_bottom-color) 50%
    );
    line-height: 1.2;
    background-clip: text;
    background-size: 100% 1lh;
    background-repeat: repeat-y;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
  &:before {
    -webkit-text-stroke: calc(1px * var(--pixel-scale)) black;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}
</style>
