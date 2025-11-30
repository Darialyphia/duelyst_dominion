import { ref, computed, watchEffect, nextTick, type Ref } from 'vue';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { useFxEvent, useGameState } from './useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import gsap, { Power0, Power2 } from 'gsap';
import { config } from '@/utils/config';
import type { Point } from '@game/shared';
import { useSprite, type SpriteData } from '@/card/composables/useSprite';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';

interface UseUnitAnimationsOptions {
  unit: UnitViewModel;
  isSelected: Ref<boolean>;
  damageIndicatorEl: Ref<HTMLElement | null>;
  spriteData: Ref<SpriteData>;
}

export function useUnitAnimations({
  unit,
  isSelected,
  spriteData,
  damageIndicatorEl
}: UseUnitAnimationsOptions) {
  const defaultAnimation = computed(() =>
    isSelected.value ? 'idle' : 'breathing'
  );

  const animationSequence = ref([defaultAnimation.value]);

  const { activeFrameRect, bgPosition, imageBg, ...spriteControls } = useSprite(
    {
      animationSequence: computed(() => animationSequence.value),
      sprite: spriteData,
      kind: computed(() => unit.getCard().kind),
      scale: 1
    }
  );

  watchEffect(() => {
    animationSequence.value = [defaultAnimation.value];
  });

  const positionOffset = ref({
    x: 0,
    y: 0
  });

  const isAttacking = ref(false);
  const latestDamageReceived = ref<number>();
  const isBeingSummoned = ref(false);

  // Movement animation
  useFxEvent(FX_EVENTS.UNIT_AFTER_MOVE, async event => {
    if (event.unit !== unit.id) return;
    const { path, previousPosition } = event;

    const stepDuration = 0.5;

    animationSequence.value = ['run'];
    const timeline = gsap.timeline();

    path.forEach((point, index) => {
      const prev = index === 0 ? previousPosition : path[index - 1];
      const prevScaled = config.CELL.toScreenPosition(prev);
      const destinationScaled = config.CELL.toScreenPosition(point);
      const deltaX = destinationScaled.x - prevScaled.x;
      const deltaY = destinationScaled.y - prevScaled.y;

      timeline.to(positionOffset.value, {
        x: `+=${deltaX}`,
        y: `+=${deltaY}`,
        duration: stepDuration,
        ease: Power0.easeNone
      });
    });

    timeline.set(positionOffset.value, { x: 0, y: 0 });

    await timeline.play();
    animationSequence.value = [defaultAnimation.value];
  });

  // Attack animation
  const onAttack = async (event: { unit: string; target: Point }) => {
    if (event.unit !== unit.id) return;
    return new Promise<void>(resolve => {
      isAttacking.value = true;
      animationSequence.value = ['attack'];
      const unsub = spriteControls.on('frame', ({ index, total }) => {
        const percentage = (index + 1) / total;
        if (percentage < 0.75) return;
        animationSequence.value = [defaultAnimation.value];
        isAttacking.value = false;
        unsub();
        resolve();
      });
    });
  };

  useFxEvent(FX_EVENTS.UNIT_BEFORE_ATTACK, onAttack);
  useFxEvent(FX_EVENTS.UNIT_BEFORE_COUNTERATTACK, onAttack);

  useFxEvent(FX_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE, async event => {
    if (event.unit !== unit.id) return;
    latestDamageReceived.value = event.damage;

    const animation = new Promise<void>(resolve => {
      isAttacking.value = true;
      animationSequence.value = ['hit'];
      const unsub = spriteControls.on('sequenceEnd', () => {
        animationSequence.value = [defaultAnimation.value];
        isAttacking.value = false;
        unsub();
        resolve();
      });
    });

    const damageIndicator = async () => {
      await nextTick();
      if (!damageIndicatorEl.value) return;

      const tl = gsap.timeline({
        onComplete: () => {
          latestDamageReceived.value = undefined;
        }
      });

      tl.fromTo(
        damageIndicatorEl.value,
        { y: 0, scale: 0.5, opacity: 0 },
        {
          y: -75,
          scale: 1.5,
          opacity: 1,
          duration: 0.3,
          ease: 'back.out(2.5)'
        }
      ).to(damageIndicatorEl.value, {
        y: -80,
        opacity: 0,
        duration: 0.3,
        delay: 0.2,
        ease: Power2.easeIn
      });
    };

    await Promise.all([animation, damageIndicator()]);
  });

  // Death animation
  useFxEvent(FX_EVENTS.UNIT_BEFORE_DESTROY, async event => {
    if (event.unit !== unit.id) return;

    return new Promise<void>(resolve => {
      isAttacking.value = true;
      animationSequence.value = ['death'];
      const unsub = spriteControls.on('sequenceEnd', () => {
        animationSequence.value = [defaultAnimation.value];
        isAttacking.value = false;
        unsub();
        resolve();
      });
    });
  });

  const state = useGameState();
  useFxEvent(FX_EVENTS.CARD_BEFORE_PLAY, async event => {
    const card = state.value.entities[event.card.id] as CardViewModel;
    if (!card) return;
    if (card.kind !== CARD_KINDS.SPELL && card.kind !== CARD_KINDS.ARTIFACT) {
      return;
    }
    if (!unit.isGeneral) return;

    return new Promise<void>(resolve => {
      animationSequence.value = ['caststart', 'castloop', 'cast', 'castend'];
      const unsub = spriteControls.on('sequenceEnd', () => {
        animationSequence.value = [defaultAnimation.value];
        isAttacking.value = false;
        unsub();
        resolve();
      });
    });
  });

  // Summon animation
  setTimeout(() => {
    isBeingSummoned.value = true;
    setTimeout(() => {
      isBeingSummoned.value = false;
    }, 650);
  }, 300);

  return {
    animationSequence,
    positionOffset,
    isAttacking,
    latestDamageReceived,
    isBeingSummoned,
    damageIndicatorEl,
    activeFrameRect,
    bgPosition,
    imageBg
  };
}
