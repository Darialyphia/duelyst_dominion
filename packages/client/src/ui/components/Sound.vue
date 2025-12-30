<script setup lang="ts">
import { Slot as RekaSlot } from 'reka-ui';
import { useSoundEffect } from '@/shared/composables/useSoundEffect';
import { isObject } from '@game/shared';

const {
  mouseenter,
  mouseleave,
  mousedown,
  mouseup,
  enabled = true,
  pitchShift
} = defineProps<{
  mouseenter?: string;
  mouseleave?: string;
  mousedown?: string;
  mouseup?: string;
  enabled?: boolean;
  pitchShift?: boolean | { min: number; max: number };
}>();

const mouseenterHowl = useSoundEffect(mouseenter);
const mouseleaveHowl = useSoundEffect(mouseleave);
const mousedownHowl = useSoundEffect(mousedown);
const mouseupHowl = useSoundEffect(mouseup);

const bind = computed(() => {
  return {
    onmouseenter: () => {
      if (!enabled) return;
      if (pitchShift) {
        const min = isObject(pitchShift) ? pitchShift.min : 0.9;
        const max = isObject(pitchShift) ? pitchShift.max : 1.05;
        const rate = min + Math.random() * (max - min);
        mouseenterHowl.sound.value?.rate(rate);
      }
      mouseenterHowl.play();
    },
    onmouseleave: () => {
      if (!enabled) return;
      if (pitchShift) {
        mouseleaveHowl.sound.value?.rate(0.98 + Math.random() * 0.04);
      }
      mouseleaveHowl.play();
    },
    onmousedown: () => {
      if (!enabled) return;
      if (pitchShift) {
        mousedownHowl.sound.value?.rate(0.98 + Math.random() * 0.04);
      }
      mousedownHowl.play();
    },
    onmouseup: () => {
      if (!enabled) return;
      if (pitchShift) {
        mouseupHowl.sound.value?.rate(0.98 + Math.random() * 0.04);
      }
      mouseupHowl.play();
    }
  };
});
</script>

<template>
  <RekaSlot v-bind="bind">
    <slot />
  </RekaSlot>
</template>
