import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type ComputedRef,
  type InjectionKey,
  type Ref
} from 'vue';
import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { RARITIES } from '@game/engine/src/card/card.enums';
import { useSafeInject } from '@/shared/composables/useSafeInject';

export type DealingStatus = 'waiting' | 'dealing' | 'done';

export interface BoosterPackCardEntry {
  blueprint: CardBlueprint;
  isFoil: boolean;
}

export type BoosterPackContext = {
  cards: ComputedRef<BoosterPackCardEntry[]>;
  flippedCards: Ref<Set<number>>;
  isRevealed: (index: number) => boolean;
  dealingStatus: Ref<DealingStatus>;
  isSweeping: Ref<boolean>;
  isShaking: Ref<boolean>;
  startShaking: () => void;
  stopShakingAndDeal: () => void;
  startSweep: (index: number) => void;
  endSweep: () => void;
  onCardHover: (index: number) => void;
  reveal: (index: number) => void;
  wrapperRefs: Ref<Array<HTMLElement | null>>;
  containerRef: Ref<HTMLElement | null>;
  canvasContainerRef: Ref<HTMLElement | null>;
  triggerLegendaryShake: () => void;
  triggerPixiExplosion: (x: number, y: number) => void;
  cardStyles: ComputedRef<Array<Record<string, string | number>>>;
  allRevealed: ComputedRef<boolean>;
  boosterId: Ref<number>;
};

export const BOOSTER_PACK_INJECTION_KEY = Symbol(
  'BoosterPackContext'
) as InjectionKey<BoosterPackContext>;

export interface ProvideBoosterPackOptions {
  cards: ComputedRef<BoosterPackCardEntry[]>;
}

const asElement = (candidate: unknown): HTMLElement | null => {
  if (!candidate) return null;
  if (candidate instanceof HTMLElement) return candidate;
  const possibleComponent = candidate as { $el?: unknown };
  return possibleComponent && possibleComponent.$el instanceof HTMLElement
    ? possibleComponent.$el
    : null;
};

const MIN_SHAKE_TIME = 1500;

export const provideBoosterPack = ({
  cards
}: ProvideBoosterPackOptions): BoosterPackContext => {
  const flippedCards = ref<Set<number>>(new Set());
  const wrapperRefs = ref<Array<HTMLElement | null>>([]);
  const containerRef = ref<HTMLElement | null>(null);
  const canvasContainerRef = ref<HTMLElement | null>(null);

  let pixiApp: PIXI.Application | null = null;

  const initPixi = () => {
    if (!canvasContainerRef.value || pixiApp) return;

    pixiApp = new PIXI.Application({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true
    });

    canvasContainerRef.value.appendChild(pixiApp.view as unknown as Node);
  };

  onMounted(initPixi);

  onBeforeUnmount(() => {
    if (pixiApp) {
      pixiApp.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true
      });
      pixiApp = null;
    }
  });

  const createParticleTexture = () => {
    if (!pixiApp) return null;

    const gfx = new PIXI.Graphics();
    gfx.beginFill(0xffffff);
    gfx.drawCircle(0, 0, 10);
    gfx.endFill();
    return pixiApp.renderer.generateTexture(gfx);
  };

  const triggerPixiExplosion = (x: number, y: number) => {
    if (!pixiApp) return;

    const container = new PIXI.Container();
    pixiApp.stage.addChild(container);

    const ring = new PIXI.Graphics();
    ring.lineStyle(5, 0xffd700, 1);
    ring.drawCircle(0, 0, 100);
    ring.position.set(x, y);
    ring.scale.set(0);
    container.addChild(ring);

    gsap.to(ring.scale, { x: 5, y: 5, duration: 1, ease: 'power2.out' });
    gsap.to(ring, { alpha: 0, duration: 1, ease: 'power2.out' });

    const texture = createParticleTexture();
    if (texture) {
      const particleCount = 200;
      for (let i = 0; i < particleCount; i += 1) {
        const sprite = new PIXI.Sprite(texture);
        sprite.x = x;
        sprite.y = y;
        sprite.anchor.set(0.5);
        sprite.tint = Math.random() < 0.5 ? 0xffd700 : 0xff4500;
        sprite.scale.set(Math.random() * 0.5 + 0.2);

        const angle = Math.random() * Math.PI * 2;
        container.addChild(sprite);

        gsap.to(sprite, {
          x: x + Math.cos(angle) * (300 + Math.random() * 200),
          y: y + Math.sin(angle) * (300 + Math.random() * 200),
          alpha: 0,
          duration: 1 + Math.random(),
          ease: 'power2.out'
        });
      }
    }

    setTimeout(() => {
      container.destroy({ children: true });
    }, 2000);
  };

  const getWrapperElements = () =>
    wrapperRefs.value
      .map(asElement)
      .filter((el): el is HTMLElement => Boolean(el));

  const dealingStatus = ref<DealingStatus>('waiting');
  const isSweeping = ref(false);
  const shakeTween = ref<gsap.core.Tween | null>(null);
  const shakeStartTime = ref(0);
  const isShaking = ref(false);
  const isDealScheduled = ref(false);

  const startShaking = () => {
    if (isDealScheduled.value) return;
    shakeStartTime.value = Date.now();
    let shakeCounter = 0;

    const shake = () => {
      shakeCounter += 0.5;
      const targets = getWrapperElements();
      if (!targets.length) return;
      shakeTween.value = gsap.to(targets, {
        x: `random(-${5 + shakeCounter}, ${5 + shakeCounter})`,
        y: `random(-${5 + shakeCounter}, ${5 + shakeCounter})`,
        duration: 0.05,
        onComplete: shake
      });
    };

    shakeTween.value?.kill();
    isShaking.value = true;
    shake();
  };

  const stopShakingAndDeal = () => {
    if (isDealScheduled.value || !shakeTween.value) return;
    isShaking.value = false;
    isDealScheduled.value = true;

    const elapsed = Date.now() - shakeStartTime.value;
    const remaining = Math.max(0, MIN_SHAKE_TIME - elapsed);

    setTimeout(() => {
      shakeTween.value?.kill();
      shakeTween.value = null;

      dealingStatus.value = 'dealing';
      setTimeout(
        () => {
          dealingStatus.value = 'done';
          isDealScheduled.value = false;
        },
        (cards.value.length + 1) * 50
      );

      const targets = getWrapperElements();
      if (targets.length) {
        gsap.to(targets, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.05,
          clearProps: 'all'
        });
      }
    }, remaining);
  };

  const triggerLegendaryShake = () => {
    if (!containerRef.value) return;
    gsap.fromTo(
      containerRef.value,
      { x: 0, y: 0 },
      {
        x: () => (Math.random() - 0.5) * 30,
        y: () => (Math.random() - 0.5) * 30,
        duration: 0.05,
        repeat: 10,
        yoyo: true,
        clearProps: 'x,y',
        ease: 'power1.inOut',
        onComplete: () => {
          console.log('Legendary shake complete');
        }
      }
    );
  };

  const isRevealed = (index: number) => flippedCards.value.has(index);

  const reveal = (index: number) => {
    if (dealingStatus.value !== 'done' || flippedCards.value.has(index)) return;

    flippedCards.value.add(index);
    const card = cards.value[index];

    if (card?.blueprint.rarity === RARITIES.LEGENDARY) {
      triggerLegendaryShake();

      const target = asElement(wrapperRefs.value[index]);
      if (target) {
        const rect = target.getBoundingClientRect();
        triggerPixiExplosion(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
      }
    }
  };

  const startSweep = (index: number) => {
    if (dealingStatus.value === 'waiting') {
      startShaking();
    } else if (dealingStatus.value === 'done') {
      isSweeping.value = true;
      if (!flippedCards.value.has(index)) {
        reveal(index);
      }
    }
  };

  const endSweep = () => {
    if (dealingStatus.value === 'waiting') {
      stopShakingAndDeal();
    }
    isSweeping.value = false;
  };

  const onCardHover = (index: number) => {
    if (
      isSweeping.value &&
      dealingStatus.value === 'done' &&
      !flippedCards.value.has(index)
    ) {
      reveal(index);
    }
  };

  const cardStyles = computed(() => {
    const count = cards.value.length;
    const radius = 1000;
    const angleStep = 18;
    const totalArc = (count - 1) * angleStep;
    const startAngle = -90 - totalArc / 2;

    return cards.value.map((_, index) => {
      const angle = startAngle + index * angleStep;
      const radian = (angle * Math.PI) / 180;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius + 800;
      const rotation = angle + 90;

      return {
        transform:
          dealingStatus.value !== 'waiting'
            ? `translate(${x}px, ${y}px) rotate(${rotation}deg)`
            : `translate(0px, 80px rotate(0deg)`,
        '--z-index': count - index
      };
    });
  });

  const allRevealed = computed(
    () => flippedCards.value.size === cards.value.length
  );

  watch(cards, () => {
    flippedCards.value.clear();
    dealingStatus.value = 'waiting';
    isSweeping.value = false;
    isShaking.value = false;
    isDealScheduled.value = false;
  });

  const boosterId = ref(0);
  watch(cards, () => {
    boosterId.value += 1;
  });

  const context: BoosterPackContext = {
    cards,
    flippedCards,
    isRevealed,
    dealingStatus,
    isSweeping,
    isShaking,
    startShaking,
    stopShakingAndDeal,
    startSweep,
    endSweep,
    onCardHover,
    reveal,
    wrapperRefs,
    containerRef,
    canvasContainerRef,
    triggerLegendaryShake,
    triggerPixiExplosion,
    cardStyles,
    allRevealed,
    boosterId
  };

  provide(BOOSTER_PACK_INJECTION_KEY, context);

  return context;
};

export const useBoosterPack = () => useSafeInject(BOOSTER_PACK_INJECTION_KEY);
