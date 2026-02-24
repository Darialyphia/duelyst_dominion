import type { SerializedInput } from '@game/engine/src/input/input-system';
import type { TutorialStepValidationResult } from '@game/engine/src/tutorial/tutorial';
import { z } from 'zod';

type Zod = typeof z;

export const simpleStepValidation =
  <T>(schema: (z: Zod) => z.ZodType<T>, msg: string) =>
  (input: SerializedInput): TutorialStepValidationResult =>
    schema(z).safeParse(input).success
      ? { status: 'success' }
      : { status: 'error', errorMessage: msg };
