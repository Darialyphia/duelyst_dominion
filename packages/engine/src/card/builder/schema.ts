import type { GenericAOEShape } from '../../aoe/aoe-shape';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import type { Game } from '../../game/game';
import { TARGETING_TYPE } from '../../targeting/targeting-strategy';
import type {
  ArtifactBlueprint,
  CardBlueprint,
  CardBlueprintBase,
  GeneralBlueprint,
  MinionBlueprint,
  SpellBlueprint
} from '../card-blueprint';
import {
  type CardSetId,
  type Rarity,
  type Faction,
  type Tag,
  type Rune,
  type CardKind,
  CARD_KINDS
} from '../card.enums';
import type { AnyCard } from '../entities/card.entity';
import type { SerializedAction } from './actions/action';
import { ACTION_LOOKUP } from './actions/action-lookup';
import { checkCondition, type Condition } from './conditions';
import { resolveCellFilter, type CellFilter } from './filters/cell.filters';
import type { Filter } from './filters/filter';
import { getAOE, type SerializedAOE } from './values/aoe';

export type CardBlueprintSchemaBase = {
  id: string;
  name: string;
  description: string;
  setId: CardSetId;
  rarity: Rarity;
  collectable: boolean;
  faction: Faction;
  // eslint-disable-next-line @typescript-eslint/ban-types
  tags: (Tag | (string & {}))[];
  sprite: {
    id: string;
  };
};

export type RuneCost = Partial<Record<Rune, number>>;

export type MinionBlueprintSchema = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  manaCost: number;
  runeCost: RuneCost;
  atk: number;
  maxHp: number;
  cmd: number;
  onInit: SerializedAction[];
  canPlay: Filter<Condition>;
  onPlay: SerializedAction[];
  getTargets: {
    min: number;
    targets: Filter<CellFilter>[];
  };
  getAoe: SerializedAOE;
};

export type SpellBlueprintSchema = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  manaCost: number;
  runeCost: RuneCost;
  onInit: SerializedAction[];
  canPlay: Filter<Condition>;
  onPlay: SerializedAction[];
  getTargets: {
    min: number;
    targets: Filter<CellFilter>[];
  };
  getAoe: SerializedAOE;
};

export type GeneralBlueprintSchema = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.GENERAL>;
  atk: number;
  maxHp: number;
  cmd: number;
  abilities: any;
  onInit: SerializedAction[];
};

export type ArtifactBlueprintSchema = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  durability: number;
  manaCost: number;
  runeCost: RuneCost;
  onInit: SerializedAction[];
  canPlay: Filter<Condition>;
  onPlay: SerializedAction[];
  getTargets: {
    min: number;
    targets: Filter<CellFilter>[];
  };
  getAoe: SerializedAOE;
};

export type CardBlueprintSchema =
  | SpellBlueprintSchema
  | ArtifactBlueprintSchema
  | MinionBlueprintSchema
  | GeneralBlueprintSchema;

export const parseMinionBlueprintSchema = (
  schema: MinionBlueprintSchema
): MinionBlueprint => {
  return {
    id: schema.id,
    name: schema.name,
    description: schema.description,
    setId: schema.setId,
    rarity: schema.rarity,
    collectable: schema.collectable,
    faction: schema.faction,
    tags: schema.tags,
    sprite: schema.sprite,
    kind: schema.kind,
    manaCost: schema.manaCost,
    runeCost: schema.runeCost,
    atk: schema.atk,
    maxHp: schema.maxHp,
    cmd: schema.cmd,
    canPlay: (game, card) =>
      checkCondition({
        game,
        card,
        conditions: schema.canPlay,
        targets: []
      }),
    getTargets: (game, card) => {
      return game.interaction.selectSpacesOnBoard({
        player: card.player,
        canCommit(selectedSpaces) {
          return selectedSpaces.length >= schema.getTargets.min;
        },
        isDone(selectedCards) {
          return selectedCards.length === schema.getTargets.targets.length;
        },
        isElligible(candidate, selectedSpaces) {
          const index = selectedSpaces.length;
          const elligibleCells = resolveCellFilter({
            game,
            card,
            targets: selectedSpaces,
            event: undefined,
            filter: schema.getTargets.targets[index]
          });

          return elligibleCells.some(cell => cell.equals(candidate));
        },
        getAoe() {
          return new PointAOEShape(TARGETING_TYPE.ANYWHERE, {}); // TODO handle target aoe
        }
      });
    },
    getAoe() {
      return getAOE(schema.getAoe);
    },
    async onInit(game, card) {
      for (const action of schema.onInit) {
        const ctor = ACTION_LOOKUP[action.type];
        // @ts-expect-error
        const instance = new ctor(action, {
          game,
          card,
          targets: []
        });

        await instance.execute();
      }
    },
    async onPlay(game, card, { targets }) {
      for (const action of schema.onPlay) {
        const ctor = ACTION_LOOKUP[action.type];
        // @ts-expect-error
        const instance = new ctor(action, {
          game,
          card,
          targets
        });

        await instance.execute();
      }
    }
  };
};

export const parseGeneralBlueprintSchema = (
  schema: GeneralBlueprintSchema
): GeneralBlueprint => {
  return {
    id: schema.id,
    name: schema.name,
    description: schema.description,
    setId: schema.setId,
    rarity: schema.rarity,
    collectable: schema.collectable,
    faction: schema.faction,
    tags: schema.tags,
    sprite: schema.sprite,
    kind: schema.kind,
    atk: schema.atk,
    maxHp: schema.maxHp,
    cmd: schema.cmd,
    abilities: schema.abilities,
    async onInit(game, card) {
      for (const action of schema.onInit) {
        const ctor = ACTION_LOOKUP[action.type];
        // @ts-expect-error
        const instance = new ctor(action, {
          game,
          card,
          targets: []
        });

        await instance.execute();
      }
    }
  };
};

export const parseSpellBlueprintSchema = (
  schema: SpellBlueprintSchema
): SpellBlueprint => {
  return {
    id: schema.id,
    name: schema.name,
    description: schema.description,
    setId: schema.setId,
    rarity: schema.rarity,
    collectable: schema.collectable,
    faction: schema.faction,
    tags: schema.tags,
    sprite: schema.sprite,
    kind: schema.kind,
    manaCost: schema.manaCost,
    runeCost: schema.runeCost,
    canPlay: (game, card) =>
      checkCondition({
        game,
        card,
        conditions: schema.canPlay,
        targets: []
      }),
    getTargets: (game, card) => {
      return game.interaction.selectSpacesOnBoard({
        player: card.player,
        canCommit(selectedSpaces) {
          return selectedSpaces.length >= schema.getTargets.min;
        },
        isDone(selectedCards) {
          return selectedCards.length === schema.getTargets.targets.length;
        },
        isElligible(candidate, selectedSpaces) {
          const index = selectedSpaces.length;
          const elligibleCells = resolveCellFilter({
            game,
            card,
            targets: selectedSpaces,
            event: undefined,
            filter: schema.getTargets.targets[index]
          });

          return elligibleCells.some(cell => cell.equals(candidate));
        },
        getAoe() {
          return new PointAOEShape(TARGETING_TYPE.ANYWHERE, {}); // TODO handle target aoe
        }
      });
    },
    getAoe() {
      return getAOE(schema.getAoe);
    },
    async onInit(game, card) {
      for (const action of schema.onInit) {
        const ctor = ACTION_LOOKUP[action.type];
        // @ts-expect-error
        const instance = new ctor(action, {
          game,
          card,
          targets: []
        });

        await instance.execute();
      }
    },
    async onPlay(game, card, { targets }) {
      for (const action of schema.onPlay) {
        const ctor = ACTION_LOOKUP[action.type];
        // @ts-expect-error
        const instance = new ctor(action, {
          game,
          card,
          targets
        });

        await instance.execute();
      }
    }
  };
};

export const parseArtifactBlueprintSchema = (
  schema: ArtifactBlueprintSchema
): ArtifactBlueprint => {
  return {
    id: schema.id,
    name: schema.name,
    description: schema.description,
    setId: schema.setId,
    rarity: schema.rarity,
    collectable: schema.collectable,
    faction: schema.faction,
    tags: schema.tags,
    sprite: schema.sprite,
    kind: schema.kind,
    durability: schema.durability,
    manaCost: schema.manaCost,
    runeCost: schema.runeCost,
    canPlay: (game, card) =>
      checkCondition({
        game,
        card,
        conditions: schema.canPlay,
        targets: []
      }),
    getTargets: (game, card) => {
      return game.interaction.selectSpacesOnBoard({
        player: card.player,
        canCommit(selectedSpaces) {
          return selectedSpaces.length >= schema.getTargets.min;
        },
        isDone(selectedCards) {
          return selectedCards.length === schema.getTargets.targets.length;
        },
        isElligible(candidate, selectedSpaces) {
          const index = selectedSpaces.length;
          const elligibleCells = resolveCellFilter({
            game,
            card,
            targets: selectedSpaces,
            event: undefined,
            filter: schema.getTargets.targets[index]
          });

          return elligibleCells.some(cell => cell.equals(candidate));
        },
        getAoe() {
          return new PointAOEShape(TARGETING_TYPE.ANYWHERE, {}); // TODO handle target aoe
        }
      });
    },
    getAoe() {
      return getAOE(schema.getAoe);
    },
    async onInit(game, card) {
      for (const action of schema.onInit) {
        const ctor = ACTION_LOOKUP[action.type];
        // @ts-expect-error
        const instance = new ctor(action, {
          game,
          card,
          targets: []
        });

        await instance.execute();
      }
    },
    async onPlay(game, card, { targets }) {
      for (const action of schema.onPlay) {
        const ctor = ACTION_LOOKUP[action.type];
        // @ts-expect-error
        const instance = new ctor(action, {
          game,
          card,
          targets
        });

        await instance.execute();
      }
    }
  };
};

export const parseCardBlueprintSchema = (schema: CardBlueprintSchema): CardBlueprint => {
  switch (schema.kind) {
    case CARD_KINDS.MINION:
      return parseMinionBlueprintSchema(schema);
    case CARD_KINDS.GENERAL:
      return parseGeneralBlueprintSchema(schema);
    case CARD_KINDS.SPELL:
      return parseSpellBlueprintSchema(schema);
    case CARD_KINDS.ARTIFACT:
      return parseArtifactBlueprintSchema(schema);
  }
};
