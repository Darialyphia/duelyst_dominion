import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent, useGameState } from './useGameClient';
import { useSoundEffect } from '@/shared/composables/useSoundEffect';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';

export const useGlobalSounds = () => {
  const state = useGameState();

  const cardSoundId = ref();
  const cardSound = useSoundEffect(cardSoundId);
  useFxEvent(FX_EVENTS.CARD_BEFORE_PLAY, async event => {
    const card = state.value.entities[event.card.id] as CardViewModel;
    cardSoundId.value = card.sounds.play;
    await nextTick();

    cardSound.value?.once('load', () => {
      cardSound.value?.play();
    });
  });
};
