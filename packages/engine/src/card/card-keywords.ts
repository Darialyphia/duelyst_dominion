import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  ADAPT: {
    id: 'adapt',
    name: 'Adapt',
    description: 'When you play this card, choose one of multiple possible effects.',
    aliases: []
  },
  AIRDROP: {
    id: 'airdrop',
    name: 'Airdrop',
    description: 'Can be summoned anywhere.',
    aliases: []
  },
  BACKSTAB: {
    id: 'backstab',
    name: 'Backstab (x)',
    description:
      'When attacking from behind, this deals extra damage and cannot be counterattacked.',
    aliases: [/^backstab$/, /backstab \([0-9]+\)/]
  },
  BATTLE_PET: {
    id: 'battlepet',
    name: 'Battle Pet',
    description:
      'This unit cannot be controlled. It moves and attacks the closest enemy at the start of your turn.',
    aliases: []
  },
  SHIELD: {
    id: 'barrier',
    name: 'Barrier',
    description: 'Prevents the next time this would be damaged or be destroyed.',
    aliases: []
  },
  BLAST: {
    id: 'blast',
    name: 'Blast',
    description:
      'Can attack any enemy in front, behind, above of below it. If it does, it attacks all enemies in that direction',
    aliases: []
  },
  BURN: {
    id: 'burn',
    name: 'Burn (x)',
    description: 'This unit x receives damage at the beginning of its turn.',
    aliases: [/burn \([0-9]+\)/]
  },
  CELERITY: {
    id: 'celerity',
    name: 'Celerity',
    description: 'Can move and attack twice per turn.',
    aliases: []
  },
  CLEANSE: {
    id: 'cleanse',
    name: 'Cleanse',
    description: 'Remove enchantments previously added from enemy sources.',
    aliases: []
  },
  CONSUME: {
    id: 'consume',
    name: 'Consume',
    description: 'Destroy the mentioned runes when this card is played.',
    aliases: []
  },
  DEATHWATCH: {
    id: 'deathwatch',
    name: 'Deathwatch',
    description: 'Triggers effect whenever a unit is destroyed.',
    aliases: []
  },
  DISCOVER: {
    id: 'discover',
    name: 'Discover',
    description: 'Choose one crd between 3 choices and add it to your hand.',
    aliases: []
  },
  DISPEL: {
    id: 'dispel',
    name: 'Dispel',
    description: 'Nullifies all abilities and enchantments previously added.',
    aliases: []
  },
  ECHO: {
    id: 'echo',
    name: 'Echo',
    description:
      'When you play this card, put an Ephemeral copy of it in your hand without echo.',
    aliases: []
  },
  ELUSIVE: {
    id: 'elusive',
    name: 'Elusive',
    description:
      'The first time this is attacked each turn, this teleports behind the attacker if possible instead of counterattacking. If it does, this unit takes no damage from the attack.',
    aliases: []
  },
  EPHEMERAL: {
    id: 'ephemeral',
    name: 'Ephemeral',
    description: "This disappears at the end of its owner's turn.",
    aliases: []
  },
  ESSENCE: {
    id: 'essence',
    name: 'Essence',
    description:
      "If you don't have enough mana, you can play this minion as a spell by paying its essence cost instead.",
    aliases: [/essence\([0-9]+\)/]
  },
  FEARSOME: {
    id: 'fearsome',
    name: 'Fearsome',
    description:
      "When this unit attacks a minion and destroys it, it doesn't counterattack.",
    aliases: []
  },
  FLEETING: {
    id: 'fleeting',
    name: 'Fleeting',
    description:
      "This card is removed from the game at the end of your turn if it's in your hand.",
    aliases: []
  },
  FLYING: {
    id: 'flying',
    name: 'Flying',
    description: 'can move two more spaces and can move through units and shrines.',
    aliases: []
  },
  FRENZY: {
    id: 'frenzy',
    name: 'Frenzy',
    description:
      'When attacking a nearby enemy, deal its attack damage to other nearby enemies.',
    aliases: ['frenzy']
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description: 'This unit skips its next action.',
    aliases: ['freeze']
  },
  GROW: {
    id: 'grow',
    name: 'Grow',
    description: 'This unit gains attack and hp at the starts of its turn.',
    aliases: []
  },
  INFILTRATE: {
    id: 'infiltrate',
    name: 'Infiltrate',
    description:
      "Has an additional effect when on the opponent's side of the battlefield",
    aliases: []
  },
  LONE_WOLF: {
    id: 'lone_wolf',
    name: 'Lone wolf',
    description: 'Triggers when this unit has no nearby allies.',
    aliases: []
  },
  ON_DESTROYED: {
    id: 'on_destroyed',
    name: 'On Destroyed',
    description: 'Triggers when the unit is destroyed.',
    aliases: ['dying wish']
  },
  ON_CAPTURE: {
    id: 'on_capture',
    name: 'On Capture',
    description: 'Triggers when this unit captures a shrine.',
    aliases: []
  },
  ON_HOLD: {
    id: 'on_capture',
    name: 'On Capture',
    description: 'Triggers when an ally shrine holds while this is nearby.',
    aliases: []
  },
  ON_ENTER: {
    id: 'on_enter',
    name: 'On Enter',
    description: 'Triggers when the unit enters the battlefield.',
    aliases: []
  },
  PROVOKE: {
    id: 'provoke',
    name: 'Provoke',
    description: 'Stops nearby enemy units from moving. They must attack this first.',
    aliases: ['provoke']
  },
  PROVOKED: {
    id: 'provoked',
    name: 'Provoked',
    description: 'Provoked - cannot move and must attack Provoker first.',
    aliases: []
  },
  RANGED: {
    id: 'ranged',
    name: 'Ranged',
    description: 'Can attack any enemy regardless of distance.',
    aliases: []
  },
  REBIRTH: {
    id: 'rebirth',
    name: 'Rebirth',
    description:
      'When destroyed, summon an egg on this space that hatches into a copy of it at the end of your next turn.',
    aliases: []
  },
  RUSH: {
    id: 'rush',
    name: 'Rush',
    description: 'This unit activates the turn it is summoned.',
    aliases: []
  },
  SLAY: {
    id: 'slay',
    name: 'Slay',
    description: 'Triggers when this unit destroys another one.',
    aliases: []
  },
  SPAWN: {
    id: 'spawn',
    name: 'Spawn X',
    description:
      'At the start of your turn, summon X on a space nearby this and lose 1 charge.',
    aliases: [/^spawn/]
  },
  STRUCTURE: {
    id: 'structure',
    name: 'Structure',
    aliases: [],
    description: 'Cannot move, attack, retaliate or gain attack.'
  },
  STUNNED: {
    id: 'stunned',
    name: 'Stunned',
    description: 'This unit skips it next turn.',
    aliases: ['stun']
  },
  SUMMONING_SICKNESS: {
    id: 'summoning_sickness',
    name: 'Summoning Sickness',
    description: 'This unit was summoned this turn and cannot act.',
    aliases: []
  },
  TIMELESS: {
    id: 'timeless',
    name: 'Timeless',
    aliases: [],
    description: 'This cannot lose durability during your turn.'
  },
  VEIL: {
    id: 'veil',
    name: 'Veil',
    description: 'Cannot be targeted by spells',
    aliases: []
  },
  WALL: {
    id: 'wall',
    name: 'Wall',
    description: 'Cannot move. Disappear when dispelled.',
    aliases: []
  },
  ZEAL: {
    id: 'zeal',
    name: 'Zeal',
    description: "Triggers an effect when nearby the player's general.",
    aliases: []
  },
  STEALTH: {
    id: 'stealth',
    name: 'Stealth',
    description: 'Cannot be targeted or attacked until this attacks.',
    aliases: []
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
