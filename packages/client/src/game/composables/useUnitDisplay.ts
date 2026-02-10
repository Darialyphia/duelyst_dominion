import { computed, type ComputedRef, type Ref } from 'vue';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { uniqBy } from 'lodash-es';
import { isDefined } from '@game/shared';
import type { SpriteData } from '@/card/composables/useSprite';
import { useFxEvent, useMyPlayer } from './useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { sprites } from '@/assets';

interface UseUnitDisplayOptions {
  unit: Ref<UnitViewModel>;
  myPlayerId: ComputedRef<string | undefined>;
}

export function useUnitDisplay({ unit, myPlayerId }: UseUnitDisplayOptions) {
  const isAlly = computed(
    () => unit.value.getPlayer()?.id === myPlayerId.value
  );

  const isP2 = computed(() => !unit.value.getPlayer()?.isPlayer1);

  const flipOverride = ref<boolean>();

  useFxEvent(FX_EVENTS.UNIT_AFTER_COMBAT, () => {
    flipOverride.value = undefined;
  });

  useFxEvent(FX_EVENTS.UNIT_BEFORE_MOVE, event => {
    if (event.unit !== unit.value.id) return;
    const destination = event.position;
    flipOverride.value = unit.value.x > destination.x;
  });

  useFxEvent(FX_EVENTS.UNIT_AFTER_MOVE, () => {
    flipOverride.value = undefined;
  });

  const isInverted = computed(() => {
    if (isDefined(flipOverride.value)) {
      return flipOverride.value;
    }
    return isP2.value;
  });

  const spriteData = computed<SpriteData>(
    () => sprites[`cards/${unit.value.getCard().spriteId}`]
  );

  const displayedModifiers = computed(() => {
    return uniqBy(
      [...unit.value.modifiers, ...unit.value.getCard().modifiers].filter(
        mod => isDefined(mod.icon) && mod.stacks > 0
      ),
      'modifierType'
    );
  });

  const atkBuffState = computed(() => {
    if (unit.value.atk > unit.value.baseAtk) return 'buff';
    if (unit.value.atk < unit.value.baseAtk) return 'debuff';
    return 'normal';
  });

  const hpBuffState = computed(() => {
    if (unit.value.hp < unit.value.maxHp) return 'debuff';
    if (unit.value.hp > unit.value.baseMaxHp) return 'buff';
    return 'normal';
  });

  const retaliationBuffState = computed(() => {
    if (unit.value.retaliation > unit.value.baseRetaliation) return 'buff';
    if (unit.value.retaliation < unit.value.baseRetaliation) return 'debuff';
    return 'normal';
  });

  const myPlayer = useMyPlayer();
  const isFlipped = computed(() => !myPlayer.value?.isPlayer1);

  return {
    isAlly,
    isInverted,
    spriteData,
    displayedModifiers,
    atkBuffState,
    hpBuffState,
    retaliationBuffState,
    isFlipped
  };
}
