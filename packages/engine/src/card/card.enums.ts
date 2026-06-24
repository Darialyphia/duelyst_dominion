import type { Values } from '@game/shared';

export const CARD_EVENTS = {
  CARD_BEFORE_PLAY: 'card.before_play',
  CARD_AFTER_PLAY: 'card.after_play',
  CARD_DISCARD: 'card.discard',
  CARD_ADD_TO_HAND: 'card.add_to_hand',
  CARD_EFFECT_TRIGGERED: 'card.effect_triggered'
} as const;
export type CardEvent = Values<typeof CARD_EVENTS>;

export const CARD_KINDS = {
  MINION: 'MINION',
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT'
} as const;
export type CardKind = Values<typeof CARD_KINDS>;

export const CARD_SETS = {
  CORE: 'CORE'
} as const;

export type CardSetId = Values<typeof CARD_SETS>;

export const RARITIES = {
  BASIC: 'basic',
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  TOKEN: 'token'
} as const;

export type Rarity = Values<typeof RARITIES>;

export const TAGS = {
  GOLEM: 'Golem',
  ARCANYST: 'Arcanyst',
  MECH: 'Mech',
  OBELYSK: 'Obelysk',
  DERVISH: 'Dervish',
  GENERAL: 'General'
} as const;
export type Tag = Values<typeof TAGS>;

export const FACTIONS = {
  F1: 'Lyonar',
  F2: 'Songhai',
  F3: 'Vetruvian',
  F4: 'Abyssian',
  F5: 'Magmar',
  F6: 'Vanar',
  NEUTRAL: 'Neutral'
} as const;
export type Faction = Values<typeof FACTIONS>;

export const FACTION_DETAILS = {
  [FACTIONS.F1]: {
    id: FACTIONS.F1,
    name: 'Lyonar',
    longName: 'Lyonar Kingdom',
    color: '#ff0000'
  },
  [FACTIONS.F2]: {
    id: FACTIONS.F2,
    name: 'Songhai',
    longName: 'Songhai Empire',
    color: '#00ff00'
  },
  [FACTIONS.F3]: {
    id: FACTIONS.F3,
    name: 'Vetruvian',
    longName: 'Vetruvian Imperium',
    color: '#0000ff'
  },
  [FACTIONS.F4]: {
    id: FACTIONS.F4,
    name: 'Abyssian',
    longName: 'Abyssian Host',
    color: '#ff00ff'
  },
  [FACTIONS.F5]: {
    id: FACTIONS.F5,
    name: 'Magmar',
    longName: 'Magmar Aspects',
    color: '#ffff00'
  },
  [FACTIONS.F6]: {
    id: FACTIONS.F6,
    name: 'Vanar',
    longName: 'Vanar Kindred',
    color: '#00ffff'
  }
};

export const CARD_LOCATIONS = {
  HAND: 'hand',
  DECK: 'deck',
  DISCARD_PILE: 'discardPile',
  BOARD: 'board'
} as const;
export type CardLocation = Values<typeof CARD_LOCATIONS>;
