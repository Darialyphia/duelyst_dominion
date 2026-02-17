import { v } from 'convex/values';
import { GetMyCollectionUseCase } from './card/usecases/getMyCollection.usecase';
import {
  internalMutationWithContainer,
  mutationWithContainer,
  queryWithContainer
} from './shared/container';
import { GrantMissingCardsUseCase } from './card/usecases/grantMissingCards.usecase';
import { CraftCardUseCase } from './card/usecases/craftCard.usecase';
import { DecraftCardUseCase } from './card/usecases/decraftCard.usecase';
import { DecraftExtraCardsUseCase } from './card/usecases/decraftExtraCards.usecase';

export const myCollection = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetMyCollectionUseCase>(
      GetMyCollectionUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});

export const grantMissing = internalMutationWithContainer({
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<GrantMissingCardsUseCase>(
      GrantMissingCardsUseCase.INJECTION_KEY
    );

    return usecase.execute({ userId: input.userId });
  }
});

export const craft = mutationWithContainer({
  args: {
    blueprintId: v.string(),
    isFoil: v.boolean()
  },
  handler: async (ctx, args) => {
    const usecase = ctx.resolve<CraftCardUseCase>(CraftCardUseCase.INJECTION_KEY);

    return usecase.execute({
      blueprintId: args.blueprintId,
      isFoil: args.isFoil
    });
  }
});

export const decraft = mutationWithContainer({
  args: {
    cardId: v.id('cards'),
    amount: v.number()
  },
  handler: async (ctx, args) => {
    const usecase = ctx.resolve<DecraftCardUseCase>(DecraftCardUseCase.INJECTION_KEY);

    return usecase.execute({
      cardId: args.cardId,
      amount: args.amount
    });
  }
});

export const decraftExtraCards = mutationWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<DecraftExtraCardsUseCase>(
      DecraftExtraCardsUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});
