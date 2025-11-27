<script setup lang="ts">
import {
  CARD_KINDS,
  FACTIONS,
  RARITIES,
  type CardKind,
  type Faction,
  type Rarity
} from '@game/engine/src/card/card.enums';
import { uppercaseFirstLetter } from '@game/shared';
import { useTemplateRef, computed, ref } from 'vue';
import CardFoil from './CardFoil.vue';
import CardGlare from './CardGlare.vue';
import type { RuneCost } from '@game/engine/src/card/card-blueprint';
import { useCardTilt } from '../composables/useCardTilt';
import CardName from './CardName.vue';
import CardDescription from './CardDescription.vue';
import CardStats from './CardStats.vue';
import CardCost from './CardCost.vue';
import CardArtwork from './CardArtwork.vue';
import { match } from 'ts-pattern';

const {
  card,
  sprite,
  isFoil,
  isTiltable = true,
  isAnimated = true,
  maxAngle = 20,
  parallaxMultiplier = 1,
  hasBacklighting = true,
  animationSequence
} = defineProps<{
  card: {
    id: string;
    name: string;
    description: string;
    manaCost?: number | null;
    baseManaCost?: number | null;
    rarity: Rarity;
    atk?: number | null;
    hp?: number | null;
    cmd?: number | null;
    durability?: number | null;
    tags?: string[];
    kind: CardKind;
    runeCost?: RuneCost;
    faction: Faction;
  };
  sprite: {
    id: string;
    frameSize: { w: number; h: number };
    sheetSize: { w: number; h: number };
    animations: Record<
      string,
      { startFrame: number; endFrame: number; frameDuration: number }
    >;
  };
  isAnimated?: boolean;
  animationSequence?: string[];
  isFoil?: boolean;
  isTiltable?: boolean;
  maxAngle?: number;
  parallaxMultiplier?: number;
  hasBacklighting?: boolean;
}>();

const rarityBg = computed(() => {
  if (
    [RARITIES.BASIC, RARITIES.COMMON, RARITIES.TOKEN].includes(
      card.rarity as any
    )
  ) {
    return `url('/assets/ui/card-rarity-common.png')`;
  }

  return `url('/assets/ui/card-rarity-${card.rarity}.png')`;
});

const factionBg = computed(() => {
  return `url('/assets/ui/crest-${card.faction.toLocaleLowerCase()}.png')`;
});

const root = useTemplateRef('card');
const { pointerStyle, angle, onMousemove, onMouseleave } = useCardTilt(root, {
  maxAngle
});

const isHovered = ref(false);
const handleMousemove = (e: MouseEvent) => {
  isHovered.value = true;
  onMousemove(e);
};
const handleMouseleave = () => {
  isHovered.value = false;
  onMouseleave();
};

const _animationSequence = computed(() => {
  if (!isAnimated) return undefined;
  if (animationSequence) return animationSequence;

  return match(card.kind)
    .with(CARD_KINDS.MINION, CARD_KINDS.GENERAL, () =>
      isHovered.value ? ['attack', 'idle'] : ['breathing']
    )
    .with(CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () =>
      isHovered.value ? ['active'] : ['default']
    )
    .exhaustive();
});

const kindImg = computed(() => {
  return `/assets/ui/card-kind-${card.kind.toLocaleLowerCase()}.png`;
});

const factionColor = computed(() => {
  return `var(--faction-${card.faction.toLocaleLowerCase()})`;
});
const factionBgOpacity = computed(() => {
  switch (card.faction) {
    case FACTIONS.F1:
      return 0.3;
    case FACTIONS.F2:
      return 0.2;
    case FACTIONS.F3:
      return 0.65;
    case FACTIONS.F4:
      return 0.3;
    case FACTIONS.F5:
      return 0.5;
    case FACTIONS.F6:
      return 0.35;
    default:
      return 0.5;
  }
});
</script>

<template>
  <div
    class="card-perspective-wrapper"
    @mousemove="handleMousemove"
    @mouseleave="handleMouseleave"
  >
    <div
      class="card"
      :class="[
        card.kind.toLocaleLowerCase(),
        isTiltable && 'animated',
        hasBacklighting && 'with-backlighting'
      ]"
      :data-flip-id="`card_${card.id}`"
      ref="card"
    >
      <div class="card-front">
        <CardFoil v-if="isFoil" />

        <CardCost
          :mana-cost="card.manaCost"
          :base-mana-cost="card.baseManaCost"
          :rune-cost="card.runeCost"
        />

        <div class="top-right parallax">
          <div class="faction" />
        </div>

        <CardStats :atk="card.atk" :hp="card.hp" :cmd="card.cmd" />

        <CardName :name="card.name" />

        <CardArtwork
          :kind="card.kind"
          :is-foil="isFoil"
          :is-tiltable="isTiltable"
          :sprite="sprite"
          :animation-sequence="_animationSequence"
          :is-hovered="isHovered"
        />

        <div class="kind parallax">
          <img :src="kindImg" :alt="card.kind" />
          {{ uppercaseFirstLetter(card.kind.toLocaleLowerCase()) }}
        </div>

        <CardDescription :description="card.description" :kind="card.kind" />

        <div class="rarity parallax" />

        <CardGlare />
      </div>
      <div class="card-back">
        <CardFoil v-if="isFoil" />
        <CardGlare />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.card-perspective-wrapper {
  position: relative;
  transform-style: preserve-3d;
  align-self: start;
  transition: filter 0.3s;
}

.card {
  --glare-x: calc(1px * v-bind('pointerStyle?.glareX'));
  --glare-y: calc(1px * v-bind('pointerStyle?.glareY'));

  --foil-oil-x: calc(1px * v-bind('pointerStyle?.foilOilX'));
  --foil-oil-y: calc(1px * v-bind('pointerStyle?.foilOilY'));
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
  display: grid;
  font-family: 'Lato', sans-serif;
  transform-style: preserve-3d;
  position: relative;

  --foil-animated-toggle: ;
  .card-perspective-wrapper:hover:has(.foil) &.animated {
    transform: rotateY(calc(1deg * v-bind('angle.y')))
      rotateX(calc(1deg * v-bind('angle.x')));
    --foil-x: calc(1% * v-bind('pointerStyle?.foilX'));
    --foil-y: calc(1% * v-bind('pointerStyle?.foilY'));
    --foil-animated-toggle: initial;
  }

  .card-perspective-wrapper:not(:hover):has(.foil) &.animated {
    transition: transform 0.5s;
  }

  > * {
    grid-column: 1;
    grid-row: 1;
  }
  &.with-backlighting:has(.foil)::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: url('/assets/ui/card-front.png');
    background-repeat: no-repeat;
    background-size: cover;
    z-index: -1;
    filter: brightness(3) saturate(2) blur(30px) hue-rotate(0deg);
    opacity: 0.75;
    mix-blend-mode: screen;
    scale: 0.95;
    --parallax-x: calc(v-bind('angle.y') * -3px);
    --parallax-y: calc(v-bind('angle.x') * 3px);
    translate: var(--parallax-x) var(--parallax-y);
    transition: translate 0.2s;
  }
}

.card-front {
  backface-visibility: hidden;
  background:
    linear-gradient(
      to top,
      hsla(from v-bind(factionColor) h s l / v-bind(factionBgOpacity)),
      transparent
    ),
    url('/assets/ui/card-front.png');
  background-size: cover, cover;
  background-blend-mode: color;
  color: #fcffcb;
  font-size: calc(var(--pixel-scale) * 8px);
  position: relative;
  transform-style: preserve-3d;
  --glare-mask: url('/assets/ui/card-front.png');
  --foil-mask: url('/assets/ui/card-front.png');
}

.card.animated:has(.foil) .parallax {
  --parallax-strength: 1;
  --parallax-factor: 1;
  --parallax-x: calc(
    v-bind('angle.y') * var(--parallax-strength) *
      calc(1px * var(--parallax-factor) * v-bind('parallaxMultiplier'))
  );
  --parallax-y: calc(
    v-bind('angle.x') * var(--parallax-strength) *
      calc(-1px * var(--parallax-factor) * v-bind('parallaxMultiplier'))
  );
  translate: var(--parallax-x) var(--parallax-y);
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('/assets/ui/card-back.png');
  background-size: cover;
  --glare-mask: url('/assets/ui/card-back.png');
  --foil-mask: url('/assets/ui/card-back.png');
}

.top-right {
  position: absolute;
  top: calc(0px * var(--pixel-scale));
  right: calc(2px * var(--pixel-scale));
  width: fit-content;
}

.kind {
  position: absolute;
  top: calc(159px * var(--pixel-scale));
  width: 100%;
  display: flex;
  gap: calc(var(--size-05) * var(--pixel-scale));
  align-items: center;
  justify-content: center;
  color: #dbc4a4;
  font-size: calc(9px * var(--pixel-scale));
  padding-inline-end: calc(8px * var(--pixel-scale));
  img {
    width: calc(16px * var(--pixel-scale));
    aspect-ratio: 1;
  }
}

.faction {
  width: calc(39px * var(--pixel-scale));
  height: calc(38px * var(--pixel-scale));
  background: v-bind(factionBg);
  background-size: cover;
}

.rarity {
  position: absolute;
  bottom: calc(0px * var(--pixel-scale));
  right: 50%;
  transform: translateX(50%);
  width: calc(14px * var(--pixel-scale));
  height: calc(17px * var(--pixel-scale));
  background: v-bind(rarityBg);
  background-size: cover;
}
</style>
