import type { SerializedInput } from '@game/engine/src/input/input-system';
import type { TutorialStepValidationResult } from '@game/engine/src/tutorial/tutorial';
import { z } from 'zod';

type Zod = typeof z;

export const simpleStepValidation =
  <T>(schema: (z: Zod) => z.ZodType<T>, msg: string) =>
  (input: SerializedInput): TutorialStepValidationResult => {
    const result = schema(z).safeParse(input);

    if (result.success) {
      return { status: 'success' };
    }

    return { status: 'error', errorMessage: msg };
  };
