import { computed, ref, watch, type MaybeRefOrGetter } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import { isDefined, type EmptyObject } from '@game/shared';
import { CARD_KINDS, type CardKind } from '@game/engine/src/card/card.enums';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';

export interface SpriteData {
  id: string;
  frameSize: { w: number; h: number };
  sheetSize: { w: number; h: number };
  animations: Record<
    string,
    { startFrame: number; endFrame: number; frameDuration: number }
  >;
}

const FALLBACK_ANIMATION_BY_KIND: Record<CardKind, string> = {
  [CARD_KINDS.MINION]: 'breathing',
  [CARD_KINDS.GENERAL]: 'breathing',
  [CARD_KINDS.SPELL]: 'default',
  [CARD_KINDS.ARTIFACT]: 'default'
};
export function useSprite({
  sprite,
  animationSequence,
  kind,
  scale = 1
}: {
  sprite: MaybeRefOrGetter<SpriteData | null>;
  animationSequence: MaybeRefOrGetter<string[] | undefined>;
  kind: MaybeRefOrGetter<CardKind>;
  scale?: number;
}) {
  const emitter = new TypedEventEmitter<{
    sequenceEnd: EmptyObject;
    frame: { index: number; total: number };
  }>();
  const spriteRef = computed(() => toValue(sprite));
  const sequenceRef = computed(() => toValue(animationSequence));
  const kindRef = computed(() => toValue(kind));
  const shouldAnimate = computed(
    () => isDefined(sequenceRef.value) && sequenceRef.value.length > 0
  );

  const sequenceToUse = computed(() => {
    if (sequenceRef.value && sequenceRef.value.length > 0) {
      return sequenceRef.value;
    }
    return [FALLBACK_ANIMATION_BY_KIND[kindRef.value]];
  });

  const currentSequenceIndex = ref(0);
  watch(sequenceToUse, () => {
    currentSequenceIndex.value = 0;
  });

  const currentAnimation = computed(() => {
    if (!spriteRef.value) return null;
    const name = sequenceToUse.value[currentSequenceIndex.value];
    return spriteRef.value.animations[name];
  });

  const currentFrame = ref(0);

  watch(
    currentAnimation,
    anim => {
      if (anim) {
        currentFrame.value = anim.startFrame;
      } else {
        currentFrame.value = 0;
      }
    },
    { immediate: true }
  );

  useIntervalFn(
    () => {
      if (!spriteRef.value) return;
      if (!currentAnimation.value || !shouldAnimate.value) return;
      const { startFrame, endFrame } = currentAnimation.value;
      const totalFrames = endFrame - startFrame + 1;

      if (currentFrame.value >= endFrame) {
        if (currentSequenceIndex.value < sequenceToUse.value.length - 1) {
          currentSequenceIndex.value++;
          // Manually update frame to avoid glitch before watcher runs
          const nextAnimName = sequenceToUse.value[currentSequenceIndex.value];
          const nextAnim = spriteRef.value.animations[nextAnimName];
          if (nextAnim) {
            currentFrame.value = nextAnim.startFrame;
          }
        } else {
          currentFrame.value = startFrame;
          emitter.emit('sequenceEnd', {});
        }
      } else {
        currentFrame.value++;
      }

      emitter.emit('frame', {
        index: currentFrame.value - startFrame,
        total: totalFrames
      });
    },
    () => currentAnimation.value?.frameDuration ?? 100
  );

  const activeFrameRect = computed(() => {
    if (!spriteRef.value) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    return {
      x: currentFrame.value * spriteRef.value.frameSize.w,
      y: 0,
      width: spriteRef.value.frameSize.w,
      height: spriteRef.value.frameSize.h
    };
  });

  const bgPosition = computed(() => {
    const { x, y } = activeFrameRect.value;
    return `calc(-${scale} * ${x}px * var(--pixel-scale)) calc(-${scale} * ${y}px * var(--pixel-scale))`;
  });

  const imageBg = computed(() => {
    return `url(/assets/cards/${spriteRef.value?.id}.png)`;
  });

  return {
    currentFrame,
    currentAnimation,
    activeFrameRect,
    bgPosition,
    imageBg,
    shouldAnimate,
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter)
  };
}
