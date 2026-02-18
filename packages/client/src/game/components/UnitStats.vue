<script setup lang="ts">
const { atk, hp, atkState, hpState, isBackRow, isMine } = defineProps<{
  atk: number;
  retaliation: number;
  hp: number;
  maxHp: number;
  atkState: 'normal' | 'buff' | 'debuff';
  retaliationState: 'normal' | 'buff' | 'debuff';
  hpState: 'normal' | 'buff' | 'debuff';
  isMine: boolean;
  isBackRow: boolean;
}>();
console.log(isBackRow, isMine);
const isTop = computed(() => isBackRow && !isMine);
</script>

<template>
  <div class="atk" :class="{ 'is-top': isTop }">
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
  <div class="retaliation" :class="{ 'is-top': isTop }">
    <span
      class="dual-text"
      :class="{
        buff: retaliationState === 'buff',
        debuff: retaliationState === 'debuff'
      }"
      :data-text="retaliation"
    >
      {{ retaliation }}
    </span>
  </div>
  <div class="hp" :class="{ 'is-top': isTop }">
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

:is(.atk, .hp, .retaliation) {
  width: 35px;
  height: 30px;
  display: grid;
  place-items: center;
  font-weight: var(--font-weight-7);
  font-size: 17px;
  position: absolute;

  &:not(.is-top) {
    bottom: -15px;
  }
  &.is-top {
    bottom: 80px;
  }
}

.atk {
  background-image: url('@/assets/ui/atk-frame-textless.png');
  background-size: cover;
  left: 10px;
}

.retaliation {
  background-image: url('@/assets/ui/ret-frame-textless.png');
  background-size: cover;
  left: 50%;
  translate: -50% 0;
}

.hp {
  background-image: url('@/assets/ui/hp-frame-textless.png');
  background-size: cover;
  right: 10px;
}
</style>
