import type { Game } from '../game/game';
import type {
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  Tag,
  Faction,
  Rune
} from './card.enums';
import type { MinionCard } from './entities/minion-card.entity';
import type { SpellCard } from './entities/spell-card.entity';
import type { ArtifactCard } from './entities/artifact-card.entity';
import type { GeneralCard } from './entities/general-card.entity';
import type { BoardCell } from '../board/entities/board-cell.entity';
import type { GenericAOEShape } from '../aoe/aoe-shape';
import type { PlayerArtifact } from '../player/player-artifact.entity';
import type { AnyCard } from './entities/card.entity';

export type CardBlueprintBase = {
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
    frameSize: { w: number; h: number };
    animations: Record<string, { startFrame: number; endFrame: number }>;
    frameDuration: number;
  };
};

export type RuneCost = Partial<Record<Rune, number>>;

export type MinionBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  manaCost: number;
  runeCost: RuneCost;
  onInit: (game: Game, card: MinionCard) => Promise<void>;
  canPlay: (game: Game, card: MinionCard) => boolean;
  onPlay: (
    game: Game,
    card: MinionCard,
    options: {
      position: BoardCell;
      targets: BoardCell[];
      aoe: GenericAOEShape;
    }
  ) => Promise<void>;
  atk: number;
  maxHp: number;
  cmd: number;
  getTargets: (game: Game, card: MinionCard) => Promise<BoardCell[]>;
  getAoe: (
    game: Game,
    card: MinionCard,
    position: BoardCell,
    targets: BoardCell[]
  ) => GenericAOEShape;
};

export type SpellBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  manaCost: number;
  runeCost: RuneCost;
  onInit: (game: Game, card: SpellCard) => Promise<void>;
  canPlay: (game: Game, card: SpellCard) => boolean;
  onPlay: (
    game: Game,
    card: SpellCard,
    options: {
      targets: BoardCell[];
      aoe: GenericAOEShape;
    }
  ) => Promise<void>;
  getTargets: (game: Game, card: SpellCard) => Promise<BoardCell[]>;
  getAoe: (game: Game, card: SpellCard, targets: BoardCell[]) => GenericAOEShape;
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

export type GeneralBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.GENERAL>;
  atk: number;
  maxHp: number;
  cmd: number;
  abilities: AbilityBlueprint<GeneralCard>[];
  onInit: (game: Game, card: GeneralCard) => Promise<void>;
};

export type ArtifactBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  durability: number;
  manaCost: number;
  runeCost: RuneCost;
  onInit: (game: Game, card: ArtifactCard) => Promise<void>;
  canPlay: (game: Game, card: ArtifactCard) => boolean;
  onPlay: (
    game: Game,
    card: ArtifactCard,
    options: {
      targets: BoardCell[];
      aoe: GenericAOEShape;
      artifact: PlayerArtifact;
    }
  ) => Promise<void>;
  getTargets: (game: Game, card: ArtifactCard) => Promise<BoardCell[]>;
  getAoe: (game: Game, card: ArtifactCard, targets: BoardCell[]) => GenericAOEShape;
};

export type CardBlueprint =
  | SpellBlueprint
  | ArtifactBlueprint
  | MinionBlueprint
  | GeneralBlueprint;
