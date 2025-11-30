import { useSoundEffect } from '@/shared/composables/useSoundEffect';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { useFxEvent } from './useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

export const useUnitSounds = (unit: Ref<UnitViewModel>) => {
  const sounds = {
    walk: useSoundEffect(computed(() => unit.value.getCard().sounds?.walk)),
    attack: useSoundEffect(computed(() => unit.value.getCard().sounds?.attack)),
    dealDamage: useSoundEffect(
      computed(() => unit.value.getCard().sounds?.dealDamage)
    ),
    takeDamage: useSoundEffect(
      computed(() => unit.value.getCard().sounds?.takeDamage)
    ),
    death: useSoundEffect(computed(() => unit.value.getCard().sounds?.death))
  };

  useFxEvent(FX_EVENTS.UNIT_BEFORE_ATTACK, async event => {
    if (event.unit !== unit.value.id) return;
    sounds.attack.value?.play();
  });

  useFxEvent(FX_EVENTS.UNIT_BEFORE_COUNTERATTACK, async event => {
    if (event.unit !== unit.value.id) return;
    sounds.attack.value?.play();
  });

  useFxEvent(FX_EVENTS.UNIT_BEFORE_DEAL_DAMAGE, async event => {
    if (event.unit !== unit.value.id) return;
    sounds.dealDamage.value?.play();
  });

  useFxEvent(FX_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE, async event => {
    if (event.unit !== unit.value.id) return;
    sounds.takeDamage.value?.play();
  });

  useFxEvent(FX_EVENTS.UNIT_BEFORE_MOVE, async event => {
    if (event.unit !== unit.value.id) return;
    sounds.walk.value?.play();
  });

  useFxEvent(FX_EVENTS.UNIT_BEFORE_DESTROY, async event => {
    if (event.unit !== unit.value.id) return;
    sounds.death.value?.play();
  });
};
