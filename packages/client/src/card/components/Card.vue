<script setup lang="ts">
import {
  RARITIES,
  type CardKind,
  type Faction,
  type Rarity
} from '@game/engine/src/card/card.enums';
import { clamp, isDefined, mapRange, uppercaseFirstLetter } from '@game/shared';
import CardText from '@/card/components/CardText.vue';
import {
  unrefElement,
  until,
  useElementBounding,
  useMouse,
  useResizeObserver
} from '@vueuse/core';
import CardFoil from './CardFoil.vue';
import CardGlare from './CardGlare.vue';
import type { RuneCost } from '@game/engine/src/card/card-blueprint';

const {
  card,
  isFoil,
  isAnimated = true
} = defineProps<{
  card: {
    id: string;
    name: string;
    description: string;
    image: string;
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
  isFoil?: boolean;
  isAnimated?: boolean;
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

const imageBg = computed(() => {
  return `url('${card.image}')`;
});

const root = useTemplateRef('card');
const { x, y } = useMouse({
  scroll: false
});

const rect = useElementBounding(root);

const pointerStyle = computed(() => {
  const left = rect.left.value ?? 0;
  const top = rect.top.value ?? 0;
  const width = rect.width.value ?? 0;
  const height = rect.height.value ?? 0;

  const pointer = {
    x: clamp(x.value - left, 0, width),
    y: clamp(y.value - top, 0, height)
  };
  const percent = {
    x: (pointer.x / width) * 100,
    y: (pointer.y / height) * 100
  };
  return {
    glareX: pointer.x,
    glareY: pointer.y,
    foilX: mapRange(percent.x, [0, 100], [0, 37.9]),
    foilY: percent.y,
    foilOilX: width - pointer.x,
    foilOilY: height - pointer.y,
    pointerFromCenter: clamp(
      Math.sqrt(
        (percent.y - 50) * (percent.y - 50) +
          (percent.x - 50) * (percent.x - 50)
      ) / 50,
      0,
      1
    )
  };
});

const setVariableFontSize = (
  box: HTMLElement,
  sizeRef: Ref<number>,
  min: number
) => {
  const inner = box.firstChild as HTMLElement;
  const outerHeight = box.clientHeight;

  let innerHeight = inner.clientHeight;

  while (innerHeight > outerHeight) {
    sizeRef.value -= 0.5;
    box.style.fontSize = `${sizeRef.value}px`;

    innerHeight = inner.clientHeight;

    if (sizeRef.value <= min) {
      break;
    }
  }
};
const descriptionBox = useTemplateRef('description-box');
const descriptionChild = computed(() => {
  if (!descriptionBox.value) return;
  return descriptionBox.value.firstChild as HTMLElement;
});
// we need a resize observer because the description box size change change when description icons are loaded for the first time
useResizeObserver(descriptionChild, () => {
  setVariableFontSize(
    descriptionBox.value!,
    descriptionFontSize,
    DESCRIPTION_MIN_TEXT_SIZE
  );
});
const DESCRIPTION_MIN_TEXT_SIZE = 12;
const DESCRIPTION_MAX_TEXT_SIZE = 18;
const descriptionFontSize = ref(DESCRIPTION_MAX_TEXT_SIZE);
until(descriptionBox)
  .toBeTruthy()
  .then(box => {
    setVariableFontSize(box, descriptionFontSize, DESCRIPTION_MIN_TEXT_SIZE);
  });

const nameBox = useTemplateRef('name-box');
const NAME_MIN_TEXT_SIZE = 14;
const NAME_MAX_TEXT_SIZE = 18;

const nameFontSize = ref(NAME_MAX_TEXT_SIZE);
until(nameBox)
  .toBeTruthy()
  .then(box => {
    setVariableFontSize(box, nameFontSize, NAME_MIN_TEXT_SIZE);
  });

const costStatus = computed(() => {
  if (isDefined(card.manaCost)) {
    if (!isDefined(card.baseManaCost) || card.baseManaCost === card.manaCost)
      return '';

    return card.manaCost < card.baseManaCost ? 'buffed' : 'debuffed';
  }

  return '';
});

const angle = ref({
  x: 0,
  y: 0
});

const MAX_ANGLE = 30;
const onMousemove = (e: MouseEvent) => {
  if (!root.value) return;

  const { clientX, clientY } = e;
  const { left, top, width, height } = unrefElement(
    root.value
  )!.getBoundingClientRect();
  angle.value = {
    y: ((clientX - left) / width - 0.5) * MAX_ANGLE,
    x: ((clientY - top) / height - 0.5) * MAX_ANGLE
  };
};

const onMouseleave = () => {
  gsap.to(angle.value, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: Power2.easeOut
  });
};
</script>

<template>
  <div
    class="card-perspective-wrapper"
    @mousemove="onMousemove"
    @mouseleave="onMouseleave"
  >
    <div
      class="card"
      :class="[card.kind.toLocaleLowerCase(), isAnimated && 'animated']"
      :data-flip-id="`card_${card.id}`"
      ref="card"
    >
      <div class="card-front">
        <CardFoil v-if="isFoil" />

        <div class="image parallax" style="--parallax-factor: 1.5">
          <div class="image-shadow" />
          <div class="image-sprite" />
        </div>

        <div class="top-left parallax">
          <div
            v-if="isDefined(card.manaCost)"
            class="mana-cost"
            :class="costStatus"
          >
            <span class="dual-text" :data-text="card.manaCost">
              {{ card.manaCost }}
            </span>
          </div>

          <template v-if="card.runeCost">
            <div class="rune red">
              <span
                v-if="isDefined(card.runeCost.red)"
                class="dual-text"
                :data-text="card.runeCost.red"
              >
                {{ card.runeCost.red }}
              </span>
            </div>
            <div class="rune yellow">
              <span
                v-if="isDefined(card.runeCost.yellow)"
                class="dual-text"
                :data-text="card.runeCost.yellow"
              >
                {{ card.runeCost.yellow }}
              </span>
            </div>
            <div class="rune blue">
              <span
                v-if="isDefined(card.runeCost.blue)"
                class="dual-text"
                :data-text="card.runeCost.blue"
              >
                {{ card.runeCost.blue }}
              </span>
            </div>
          </template>
        </div>

        <div class="top-right parallax">
          <div class="faction" />
        </div>

        <div class="bottom-left parallax">
          <div
            class="stat cmd"
            :style="{ opacity: isDefined(card.cmd) ? 1 : 0 }"
          >
            <span class="dual-text" :data-text="card.cmd">
              {{ card.cmd }}
            </span>
          </div>

          <div
            class="stat atk"
            :style="{ opacity: isDefined(card.atk) ? 1 : 0 }"
          >
            <span class="dual-text" :data-text="card.atk">
              {{ card.atk }}
            </span>
          </div>

          <div class="stat hp" :style="{ opacity: isDefined(card.hp) ? 1 : 0 }">
            <span class="dual-text" :data-text="card.hp">
              {{ card.hp }}
            </span>
          </div>
        </div>

        <div ref="name-box" class="name parallax">
          <svg viewBox="0 0 500 200" class="w-full">
            <defs>
              <radialGradient id="name-gradient">
                <stop offset="15%" stop-color="#cbb599" />
                <stop offset="80%" stop-color="#9a8270" />
              </radialGradient>
            </defs>

            <path
              id="curve"
              d="
              M 0 150
              C 150 100 350 100 500 150
              "
            />
            <text>
              <textPath
                class="name-text"
                xlink:href="#curve"
                text-anchor="middle"
                startOffset="50%"
                stroke="black"
                paint-order="stroke"
                fill="url(#name-gradient)"
              >
                {{ card.name }}
              </textPath>
            </text>
          </svg>
        </div>

        <div class="kind parallax">
          {{ uppercaseFirstLetter(card.kind.toLocaleLowerCase()) }}
        </div>

        <div ref="description-box" class="description parallax">
          <CardText :text="card.description" />
        </div>

        <div class="rarity" />

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
  /* --pointer-from-center: v-bind('pointerStyle?.pointerFromCenter'); */
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

  > * {
    grid-column: 1;
    grid-row: 1;
  }
  &:has(.foil)::after {
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
    /* animation: foil-pulse 5s var(--ease-out-3) infinite; */
    --parallax-x: calc(v-bind('angle.y') * -3px);
    --parallax-y: calc(v-bind('angle.x') * 3px);
    translate: var(--parallax-x) var(--parallax-y);
    transition: translate 0.2s;
  }
}

.card-front {
  backface-visibility: hidden;
  background: url('/assets/ui/card-front.png');
  background-size: cover;
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
      calc(1px * var(--parallax-factor))
  );
  --parallax-y: calc(
    v-bind('angle.x') * var(--parallax-strength) *
      calc(-1px * var(--parallax-factor))
  );
  translate: var(--parallax-x) var(--parallax-y);
}

.front-content {
  position: absolute;
  transform-style: preserve-3d;
  inset: 0;
  transform: translateZ(150px);
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('/assets/ui/card-back.png');
  background-size: cover;
  --glare-mask: url('/assets/ui/card-back.png');
  --foil-mask: url('/assets/ui/card-back.png');
}

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
    /* z-index: -1; */
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}

.image {
  position: absolute;
  width: calc(2 * 96px * var(--pixel-scale));
  height: calc(2 * 96px * var(--pixel-scale));
  pointer-events: none;
  .card:is(.animated:not(:has(.foil)), :not(.animated)) & {
    translate: -50% 0 !important;
  }

  .image-shadow {
    position: absolute;
    width: calc(2 * 96px * var(--pixel-scale));
    height: calc(2 * 96px * var(--pixel-scale));
    opacity: 0;
    pointer-events: none;
    background: v-bind(imageBg);
    background-size: cover;
    background-position: center calc(-62px * var(--pixel-scale));
    background-repeat: no-repeat;
    translate: calc(-2 * var(--parallax-x))
      calc(-2 * var(--parallax-y) - var(--pixel-scale) * 6px);
    filter: contrast(0) brightness(0) blur(3px);
    scale: 1.15;
    transition: opacity 1s var(--ease-3);

    .card-perspective-wrapper:has(.foil):hover & {
      opacity: 0.35;
    }

    .card:is(.animated:not(:has(.foil)), :not(.animated)) & {
      translate: 50% 0 !important;
    }
  }

  .image-sprite {
    position: absolute;
    width: calc(2 * 96px * var(--pixel-scale));
    height: calc(2 * 96px * var(--pixel-scale));
    background: v-bind(imageBg);
    background-size: cover;
    background-position: center calc(-62px * var(--pixel-scale));
    background-repeat: no-repeat;
    top: calc(5px * var(--pixel-scale));
    left: 50%;
    translate: calc(-50% + var(--parallax-x, 0)) var(--parallax-y, 0) !important;
    pointer-events: none;
  }
}

.description {
  height: calc(54px * var(--pixel-scale));
  position: absolute;
  top: calc(180px * var(--pixel-scale));
  left: calc(43px * var(--pixel-scale));
  width: calc(100% - (66px * var(--pixel-scale)));
  font-size: calc(var(--pixel-scale) * 0.5px * v-bind(descriptionFontSize));
  overflow: hidden;
  line-height: 1.2;
  text-shadow: 0 0 5px black;
  &.is-multi-line {
    text-align: left;
  }
  > * {
    display: inline-block;
  }
  > span {
    width: 1px;
    height: 1px;
    align-self: start;
    vertical-align: top;
  }
}

.top-left {
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  left: calc(2px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  gap: calc(4px * var(--pixel-scale));
}

.bottom-left {
  position: absolute;
  bottom: calc(3px * var(--pixel-scale));
  left: calc(5px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  gap: calc(3px * var(--pixel-scale));
}

.top-right {
  position: absolute;
  top: calc(0px * var(--pixel-scale));
  right: calc(2px * var(--pixel-scale));
  width: fit-content;
}

.mana-cost {
  width: calc(29px * var(--pixel-scale));
  height: calc(32px * var(--pixel-scale));
  background: url('/assets/ui/mana-cost.png');
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(14px * var(--pixel-scale));
  font-weight: bold;
  &.buffed {
    --top-color: #9eff9e;
    --bottom-color: #00cc00;
  }
  &.debuffed {
    --top-color: #ff9e9e;
    --bottom-color: #cc0000;
  }
}

.rune {
  width: calc(17px * var(--pixel-scale));
  height: calc(21px * var(--pixel-scale));
  background-size: cover;
  font-size: calc(14px * var(--pixel-scale));
  font-weight: bold;
  color: white;
  display: grid;
  place-items: center;
  --top-color: white;
  --bottom-color: #dec7a6;
  text-shadow: 0 3px 1rem black;
  &.red {
    background-image: url('/assets/ui/rune-red.png');
  }
  &.yellow {
    background-image: url('/assets/ui/rune-yellow.png');
  }
  &.blue {
    background-image: url('/assets/ui/rune-blue.png');
  }
}

.name {
  position: absolute;
  top: calc(108px * var(--pixel-scale));
  width: 100%;
  text-align: center;
  font-weight: bold;

  svg path {
    fill: transparent;
  }

  svg text {
    font-size: calc(1px * v-bind(nameFontSize) * var(--pixel-scale));
    fill: #dbc4a4;
    filter: drop-shadow(0 calc(2.5px * var(--pixel-scale)) 0 black);
  }
}

.kind {
  position: absolute;
  top: calc(162px * var(--pixel-scale));
  width: 100%;
  text-align: center;
  color: #dbc4a4;
  font-size: calc(8px * var(--pixel-scale));
}

.stat {
  width: calc(35px * var(--pixel-scale));
  height: calc(30px * var(--pixel-scale));
  background-size: cover;
  font-size: calc(14px * var(--pixel-scale));
  font-weight: bold;
  display: grid;
  place-items: center;
  padding-right: calc(2px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  &.cmd {
    background-image: url('/assets/ui/cmd-frame.png');
  }
  &.atk {
    background-image: url('/assets/ui/atk-frame.png');
  }
  &.hp {
    background-image: url('/assets/ui/hp-frame.png');
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
  translate: 50% 0;
  width: calc(14px * var(--pixel-scale));
  height: calc(17px * var(--pixel-scale));
  background: v-bind(rarityBg);
  background-size: cover;
}
</style>
