<script setup lang="ts">
import { isDefined } from '@game/shared';

defineProps<{
  atk?: number | null;
  hp?: number | null;
  cmd?: number | null;
}>();
</script>

<template>
  <div class="bottom-left parallax">
    <!-- <div class="stat cmd" :style="{ opacity: isDefined(cmd) ? 1 : 0 }">
      <span class="dual-text" :data-text="cmd">
        {{ cmd }}
      </span>
    </div> -->

    <div class="stat atk" :style="{ opacity: isDefined(atk) ? 1 : 0 }">
      <span class="dual-text" :data-text="atk">
        {{ atk }}
      </span>
    </div>

    <div class="stat hp" :style="{ opacity: isDefined(hp) ? 1 : 0 }">
      <span class="dual-text" :data-text="hp">
        {{ hp }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.bottom-left {
  position: absolute;
  bottom: calc(3px * var(--pixel-scale));
  left: calc(3px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  gap: calc(3px * var(--pixel-scale));
}

.stat {
  width: calc(35px * var(--pixel-scale));
  height: calc(30px * var(--pixel-scale));
  background-size: cover;
  font-size: calc(14px * var(--pixel-scale));
  font-weight: bold;
  display: grid;
  place-items: center;
  padding-right: calc(2px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  &.cmd {
    background-image: url('@/assets/ui/cmd-frame.png');
  }
  &.atk {
    background-image: url('@/assets/ui/atk-frame.png');
  }
  &.hp {
    background-image: url('@/assets/ui/hp-frame.png');
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
