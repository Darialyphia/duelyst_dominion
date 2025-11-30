<script setup lang="ts">
const { atk, hp, atkState, hpState } = defineProps<{
  atk: number;
  hp: number;
  atkState: 'normal' | 'buff' | 'debuff';
  hpState: 'normal' | 'buff' | 'debuff';
}>();
</script>

<template>
  <div class="atk">
    <span
      class="dual-text"
      :class="{
        buff: atkState === 'buff',
        debuff: atkState === 'debuff'
      }"
      :data-text="atk"
    >
      {{ atk }}
    </span>
  </div>
  <div class="hp">
    <span
      class="dual-text"
      :class="{
        buff: hpState === 'buff',
        debuff: hpState === 'debuff'
      }"
      :data-text="hp"
    >
      {{ hp }}
    </span>
  </div>
</template>

<style scoped lang="postcss">
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

  &.buff {
    --top-color: var(--green-3);
    --bottom-color: var(--green-6);
  }

  &.debuff {
    --top-color: var(--red-4);
    --bottom-color: var(--red-7);
  }
}

:is(.atk, .hp) {
  width: 35px;
  height: 30px;
  display: grid;
  place-items: center;
  font-weight: var(--font-weight-7);
  font-size: 17px;
  position: absolute;
}

.atk {
  background-image: url('/assets/ui/atk-frame-textless.png');
  background-size: cover;
  left: 0;
  bottom: -5px;
}

.hp {
  background-image: url('/assets/ui/hp-frame-textless.png');
  background-size: cover;
  right: 0;
  bottom: -5px;
}
</style>
