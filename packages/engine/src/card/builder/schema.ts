import type { GenericAOEShape } from '../../aoe/aoe-shape';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import type { Game } from '../../game/game';
import type { CardBlueprintBase } from '../card-blueprint';
import type {
  CardSetId,
  Rarity,
  Faction,
  Tag,
  Rune,
  CardKind,
  CARD_KINDS
} from '../card.enums';
import type { AnyCard } from '../entities/card.entity';
import type { Condition } from './conditions';
import type { CellFilter } from './filters/cell.filters';
import type { SerializedAOE } from './values/aoe';

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
  onInit: any;
  canPlay: Condition;
  onPlay: any;
  getTargets: {
    min: number;
    targets: CellFilter[];
  };
  getAoe: SerializedAOE;
};

export type SpellBlueprintSchema = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  manaCost: number;
  runeCost: RuneCost;
  onInit: any;
  canPlay: any;
  onPlay: any;
  getTargets: any;
  getAoe: any;
};

export type AbilityBlueprint<T extends AnyCard> = {
  id: string;
  description: string;
  manaCost: number;
  getTargets: (game: Game, card: T) => Promise<BoardCell[]>;
  getAoe: (game: Game, card: T, targets: BoardCell[]) => GenericAOEShape;
  getCooldown: (game: Game, card: T) => number;
  getMaxUses: (game: Game, card: T) => number;
  canUse(game: Game, card: T): boolean;
  onResolve(
    game: Game,
    card: T,
    options: {
      targets: BoardCell[];
      aoe: GenericAOEShape;
    }
  ): void;
};

export type GeneralBlueprintSchema = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.GENERAL>;
  atk: number;
  maxHp: number;
  cmd: number;
  abilities: any;
  onInit: any;
};

export type ArtifactBlueprintSchema = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  durability: number;
  manaCost: number;
  runeCost: RuneCost;
  onInit: any;
  canPlay: any;
  onPlay: any;
  getTargets: any;
  getAoe: any;
};

export type CardBlueprint =
  | SpellBlueprintSchema
  | ArtifactBlueprintSchema
  | MinionBlueprintSchema
  | GeneralBlueprintSchema;
