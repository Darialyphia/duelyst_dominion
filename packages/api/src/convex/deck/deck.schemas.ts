import { FACTIONS } from '@game/engine/src/card/card.enums';
import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const deckSchemas = {
  decks: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    cards: v.array(
      v.object({
        cardId: v.id('cards'),
        copies: v.number()
      })
    ),
    faction: v.optional(
      v.union(
        v.literal(FACTIONS.F1),
        v.literal(FACTIONS.F2),
        v.literal(FACTIONS.F3),
        v.literal(FACTIONS.F4),
        v.literal(FACTIONS.F5),
        v.literal(FACTIONS.F6)
      )
    )
  }).index('by_owner_id', ['ownerId'])
};
