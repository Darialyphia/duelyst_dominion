import { ref, type Ref, type MaybeRefOrGetter } from 'vue';
import { until, useResizeObserver, unrefElement } from '@vueuse/core';

export function useAutoResizeText(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: { min: number; max: number }
) {
  const fontSize = ref(options.max);

  const setVariableFontSize = (
    box: HTMLElement,
    sizeRef: Ref<number>,
    min: number
  ) => {
    const inner = box.firstChild as HTMLElement;
    if (!inner) return;

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

  until(() => unrefElement(target))
    .toBeTruthy()
    .then(el => {
      const box = el as HTMLElement;
      setVariableFontSize(box, fontSize, options.min);

      const child = box.firstChild as HTMLElement;
      if (child) {
        useResizeObserver(child, () => {
          setVariableFontSize(box, fontSize, options.min);
        });
      }
    });

  return {
    fontSize
  };
}
