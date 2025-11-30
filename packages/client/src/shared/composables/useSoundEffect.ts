import { Howl } from 'howler';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from './useSettings';
import { isDefined } from '@game/shared';

export const useSoundEffect = (sound: MaybeRef<string | undefined>) => {
  const SCALE_FACTOR = 0.8;
  const { settings: userSettings } = storeToRefs(useSettingsStore());

  const howl = ref() as Ref<Howl | undefined>;

  watchEffect(() => {
    const id = unref(sound);
    if (!isDefined(id)) return;
    howl.value = new Howl({
      src: `/assets/sfx/${id}`,
      volume: (userSettings.value.sound.sfxVolume[0] / 100) * SCALE_FACTOR
    });
  });

  watchEffect(() => {
    howl.value?.volume(
      (userSettings.value.sound.sfxVolume[0] / 100) * SCALE_FACTOR
    );
  });

  return howl;
};
