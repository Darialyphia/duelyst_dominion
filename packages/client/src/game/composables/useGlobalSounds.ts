import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent, useGameState } from './useGameClient';
import { useSoundEffect } from '@/shared/composables/useSoundEffect';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';

export const useGlobalSounds = () => {
  const state = useGameState();

  const cardSoundId = ref();
  const { play: playCardSound } = useSoundEffect(cardSoundId);
  useFxEvent(FX_EVENTS.CARD_BEFORE_PLAY, async event => {
    const card = state.value.entities[event.card.id] as CardViewModel;
    if (card.kind === CARD_KINDS.MINION) return;
    cardSoundId.value = card.sounds.play;
    playCardSound();
  });

  const effectTriggeredsound = useSoundEffect(
    'sfx_loot_crate_card_reward_reveal_0'
  );

  useFxEvent(FX_EVENTS.UNIT_EFFECT_TRIGGERED, async () => {
    effectTriggeredsound.play();
  });
};
