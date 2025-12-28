import { computed, type Ref, type ComputedRef } from 'vue';

interface UseUnitEffectsOptions {
  latestDamageReceived: Ref<number | undefined>;
  activeFrameRect: ComputedRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export function useUnitEffects({
  latestDamageReceived,
  activeFrameRect
}: UseUnitEffectsOptions) {
  const damageEffects = computed(() => {
    return [
      {
        spriteId: 'fx/impact',
        animationSequence: ['impactorangebig'],
        scale: 1.25,
        offset: {
          x: 0,
          y: 0
        }
      },
      {
        spriteId: 'fx/collision',
        animationSequence: ['collisionsparksblue'],
        scale: 1.25,
        offset: {
          x: -10,
          y: 10
        }
      },
      {
        spriteId: 'fx/bloodground',
        animationSequence: ['bloodground2'],
        scale: 1,
        offset: {
          x: -activeFrameRect.value.width / 3,
          y: 45
        }
      }
    ];
  });

  const showDamageEffects = computed(() => !!latestDamageReceived.value);

  return {
    damageEffects,
    showDamageEffects
  };
}
