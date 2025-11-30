import { computed, type Ref, type ComputedRef } from 'vue';

interface UseUnitEffectsOptions {
  latestDamageReceived: Ref<number | undefined>;
  isBeingSummoned: Ref<boolean>;
  activeFrameRect: ComputedRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export function useUnitEffects({
  latestDamageReceived,
  isBeingSummoned,
  activeFrameRect
}: UseUnitEffectsOptions) {
  const damageEffects = computed(() => {
    return [
      {
        spriteId: 'impact',
        animationSequence: ['impactorangebig'],
        scale: 1.25,
        offset: {
          x: 0,
          y: 0
        }
      },
      {
        spriteId: 'collision',
        animationSequence: ['collisionsparksblue'],
        scale: 1.25,
        offset: {
          x: -10,
          y: 10
        }
      },
      {
        spriteId: 'bloodground',
        animationSequence: ['bloodground2'],
        scale: 1,
        offset: {
          x: -activeFrameRect.value.width / 3,
          y: 45
        }
      }
    ];
  });

  const summonEffects = computed(() => {
    if (!isBeingSummoned.value) return [];

    return [
      {
        spriteId: 'smokeground',
        animationSequence: ['smokeground'],
        scale: 1,
        offset: {
          x: 0,
          y: 40
        }
      }
    ];
  });

  const showDamageEffects = computed(() => !!latestDamageReceived.value);
  const showSummonEffects = computed(() => isBeingSummoned.value);

  return {
    damageEffects,
    summonEffects,
    showDamageEffects,
    showSummonEffects
  };
}
