<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { useGameUi, useMyPlayer } from '../composables/useGameClient';
import BoardPositioner from './BoardPositioner.vue';
import { useIsInAoe } from '../composables/useIsInAoe';
import SpriteFX from './SpriteFX.vue';
import { useUnitAnimations } from '../composables/useUnitAnimations';
import { useUnitDisplay } from '../composables/useUnitDisplay';
import { useUnitEffects } from '../composables/useUnitEffects';
import UnitStats from './UnitStats.vue';
import UnitModifiers from './UnitModifiers.vue';
import UnitSprite from './UnitSprite.vue';
import UnitShadow from './UnitShadow.vue';
import { useUnitSounds } from '../composables/useUnitSounds';
import { useElementBounding } from '@vueuse/core';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useGameUi();
const myPlayer = useMyPlayer();

const {
  isAlly,
  isFlipped,
  spriteData,
  displayedModifiers,
  atkBuffState,
  hpBuffState
} = useUnitDisplay({
  unit: computed(() => unit),
  myPlayerId: computed(() => myPlayer.value?.id)
});

useUnitSounds(computed(() => unit));
const isSelected = computed(() => ui.value.selectedUnit?.equals(unit) ?? false);

const damageIndicatorEl = useTemplateRef('damageIndicator');
const healIndicatorEl = useTemplateRef('healIndicator');

const {
  activeFrameRect,
  bgPosition,
  imageBg,
  positionOffset,
  isAttacking,
  latestDamageReceived,
  latestHealReceived
} = useUnitAnimations({
  unit,
  isSelected,
  spriteData,
  damageIndicatorEl,
  healIndicatorEl
});

const { damageEffects, showDamageEffects } = useUnitEffects({
  latestDamageReceived,
  activeFrameRect
});

const isInAoe = useIsInAoe();

const element = ref<HTMLElement>();
onMounted(() => {
  element.value = ui.value.DOMSelectors.unit(unit.id).element!;
});
const rect = useElementBounding(element);
const isHovered = computed(() => {
  return (
    ui.value.hoveredCell?.x === unit.x && ui.value.hoveredCell?.y === unit.y
  );
});
</script>

<template>
  <BoardPositioner
    :id="ui.DOMSelectors.unit(unit.id).id"
    :x="unit.x"
    :y="unit.y"
    :class="{ 'is-attacking': isAttacking }"
    :style="{
      translate: `${positionOffset.x}px ${positionOffset.y}px`
    }"
  >
    <UnitShadow
      :unit="unit"
      :bg-position="bgPosition"
      :image-bg="imageBg"
      :sprite-width="activeFrameRect.width"
      :sprite-height="activeFrameRect.height"
      :sheet-width="spriteData.sheetSize.w"
      :sheet-height="spriteData.sheetSize.h"
      :is-flipped="isFlipped"
    />
    <div
      class="unit"
      :class="[
        isAlly ? 'ally' : 'enemy',
        {
          'in-aoe': isInAoe({ x: unit.x, y: unit.y }),
          'is-exhausted':
            unit.isExhausted && myPlayer.equals(unit.getPlayer()!),
          'is-selected': ui.selectedUnit?.equals(unit),
          'is-flipped': isFlipped
        }
      ]"
    >
      <div class="unit-light" v-if="isSelected" />
      <UnitSprite
        :unit-id="unit.id"
        :bg-position="bgPosition"
        :image-bg="imageBg"
        :sprite-width="activeFrameRect.width"
        :sprite-height="activeFrameRect.height"
        :sheet-width="spriteData.sheetSize.w"
        :sheet-height="spriteData.sheetSize.h"
        :is-flipped="isFlipped"
        :is-foil="unit.getCard().isFoil"
      />

      <UnitStats
        :atk="unit.atk"
        :hp="unit.hp"
        :atk-state="atkBuffState"
        :hp-state="hpBuffState"
        :max-hp="unit.maxHp"
      />

      <div
        ref="damageIndicator"
        v-if="latestDamageReceived"
        class="damage-indicator"
      >
        {{ latestDamageReceived }}
      </div>

      <div ref="healIndicator" v-if="latestHealReceived" class="heal-indicator">
        +{{ latestHealReceived }}
      </div>

      <SpriteFX
        v-if="showDamageEffects"
        class="fx-container"
        :class="{ 'is-flipped': isFlipped }"
        :sprites="damageEffects"
      />

      <Teleport to="#lights-teleport" defer>
        <Transition>
          <div
            v-if="isHovered"
            class="light"
            :style="{
              '--x': rect.left.value + rect.width.value / 2 + 'px',
              '--y': rect.top.value + rect.height.value / 2 + 'px',
              '--color': `var(--faction-${unit.getCard().faction.toLocaleLowerCase()})`
            }"
          />
        </Transition>
      </Teleport>
      <UnitModifiers :modifiers="displayedModifiers" />
    </div>
  </BoardPositioner>
</template>

<style scoped lang="postcss">
.is-attacking {
  z-index: 1;
}

.unit {
  --pixel-scale: 2;
  position: relative;
  pointer-events: none;
  width: 100%;
  height: 100%;
  bottom: 0;
  transform: translateZ(10px) translateY(-15px)
    rotateX(calc(var(--board-angle-X) * -1))
    rotateY(calc(var(--board-angle-Y) * -1));
  transform-origin: bottom center;

  &.is-flipped :deep(.sprite-wrapper) {
    scale: -2 2;
  }
}

.unit.is-exhausted :deep(.sprite) {
  filter: grayscale(100%) brightness(70%);
}
.unit :deep(.sprite) {
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    mix-blend-mode: color;
    mask-image: v-bind(imageBg);
    mask-position: var(--bg-position);
    mask-repeat: no-repeat;
    mask-size: var(--background-width) var(--background-height);
  }
}

.unit.in-aoe :deep(.sprite)::after {
  opacity: 0.3;
}

.damage-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-8);
  color: var(--red-7);
  pointer-events: none;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.heal-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-8);
  color: var(--green-7);
  pointer-events: none;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.fx-container {
  position: absolute;
  inset: 0;
  &.is-flipped {
    scale: -1 1;
  }
}

.light {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 800px;
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--color) 0%, transparent 50%);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%) rotateX(-15deg);
  mix-blend-mode: color-dodge;
  transform-origin: center center;
  opacity: 0; /* disable for now */
  &:is(.v-enter-active, .v-leave-active) {
    transition:
      opacity 0.3s var(--ease-3),
      transform 0.3s var(--ease-3);
  }
  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.25);
  }
}
</style>
