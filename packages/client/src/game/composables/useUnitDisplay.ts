import { computed, type ComputedRef, type Ref } from 'vue';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import sprites from 'virtual:sprites';
import { uniqBy } from 'lodash-es';
import { isDefined } from '@game/shared';
import type { SpriteData } from '@/card/composables/useSprite';
import { useFxEvent, useUnits } from './useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

interface UseUnitDisplayOptions {
  unit: Ref<UnitViewModel>;
  myPlayerId: ComputedRef<string | undefined>;
}

export function useUnitDisplay({ unit, myPlayerId }: UseUnitDisplayOptions) {
  const units = useUnits();
  const isAlly = computed(
    () => unit.value.getPlayer()?.id === myPlayerId.value
  );

  const isP2 = computed(() => !unit.value.getPlayer()?.isPlayer1);

  const flipOverride = ref<boolean>();
  useFxEvent(FX_EVENTS.UNIT_BEFORE_ATTACK, event => {
    const attacker = units.value.find(u => u.id === event.unit);
    const defender = units.value.find(
      u => u.x === event.target.x && u.y === event.target.y
    );
    if (!attacker || !defender) return;
    if (!attacker.equals(unit.value) && !defender.equals(unit.value)) return;

    if (attacker.getPlayer()?.isPlayer1 && defender.x < attacker.x) {
      flipOverride.value = attacker.equals(unit.value);
    }

    if (!attacker.getPlayer()?.isPlayer1 && defender.x > attacker.x) {
      flipOverride.value = !attacker.equals(unit.value);
    }
  });

  useFxEvent(FX_EVENTS.UNIT_AFTER_COMBAT, () => {
    flipOverride.value = undefined;
  });

  const isFlipped = computed(() => {
    if (isDefined(flipOverride.value)) {
      return flipOverride.value;
    }
    return isP2.value;
  });

  const spriteData = computed<SpriteData>(
    () => sprites[unit.value.getCard().spriteId]
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

  return {
    isAlly,
    isFlipped,
    spriteData,
    displayedModifiers,
    atkBuffState,
    hpBuffState
  };
}
