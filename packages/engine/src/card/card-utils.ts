import type { GenericAOEShape } from '../aoe/aoe-shape';
import { PointAOEShape } from '../aoe/point.aoe-shape';
import type { BoardCell } from '../board/entities/board-cell.entity';
import type { Game } from '../game/game';
import { UnitEffectModifierMixin } from '../modifier/mixins/unit-effect.mixin';
import type { Modifier } from '../modifier/modifier.entity';
import { TARGETING_TYPE } from '../targeting/targeting-strategy';
import type { Unit } from '../unit/unit.entity';
import { CARD_KINDS } from './card.enums';
import type { ArtifactCard } from './entities/artifact-card.entity';
import type { AnyCard } from './entities/card.entity';
import type { GeneralCard } from './entities/general-card.entity';
import type { MinionCard } from './entities/minion-card.entity';
import type { SpellCard } from './entities/spell-card.entity';

export const isGeneral = (card: AnyCard): card is GeneralCard => {
  return card.kind === CARD_KINDS.GENERAL;
};

export const isMinion = (card: AnyCard): card is MinionCard => {
  return card.kind === CARD_KINDS.MINION;
};

export const isSpell = (card: AnyCard): card is SpellCard => {
  return card.kind === CARD_KINDS.SPELL;
};

export const isArtifact = (card: AnyCard): card is ArtifactCard => {
  return card.kind === CARD_KINDS.ARTIFACT;
};

export const isMinionOrGeneral = (card: AnyCard): card is MinionCard | GeneralCard => {
  return isMinion(card) || isGeneral(card);
};

export const singleEnemyTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (unit: Unit) => boolean = () => true) {
    return (
      card.player.enemyUnits.filter(unit => unit.canBeTargetedBy(card) && predicate(unit))
        .length > 0
    );
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    {
      predicate = () => true,
      getAoe = () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
      required = true
    }: {
      predicate?: (unit: Unit) => boolean;
      getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
      required?: boolean;
    }
  ) {
    return await game.interaction.selectSpacesOnBoard({
      player: card.player,
      getAoe,
      isElligible(candidate, selectedCards) {
        if (!candidate.unit) return false;

        return (
          candidate.unit.isEnemy(card.player) &&
          candidate.unit.canBeTargetedBy(card) &&
          !selectedCards.some(selected => selected.equals(candidate)) &&
          predicate(candidate.unit)
        );
      },
      canCommit(selectedCards) {
        return required ? selectedCards.length === 1 : true;
      },
      isDone(selectedCards) {
        return selectedCards.length === 1;
      }
    });
  }
};

export const singleMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: Unit) => boolean = () => true) {
    return (
      [...card.player.minions, ...card.player.enemyMinions].filter(
        unit => unit.canBeTargetedBy(card) && predicate(unit)
      ).length > 0
    );
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    {
      required = true,
      predicate = () => true,
      getAoe = () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {})
    }: {
      required?: boolean;
      predicate?: (unit: Unit) => boolean;
      getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
    } = {}
  ) {
    return await game.interaction.selectSpacesOnBoard({
      player: card.player,
      getAoe,
      isElligible(candidate, selectedCells) {
        if (!candidate.unit || !isMinion(candidate.unit.card)) {
          return false;
        }

        return (
          candidate.unit.canBeTargetedBy(card) &&
          !selectedCells.some(selected => selected.equals(candidate)) &&
          predicate(candidate.unit)
        );
      },
      canCommit(selectedCards) {
        return required ? selectedCards.length === 1 : true;
      },
      isDone(selectedCards) {
        return selectedCards.length === 1;
      }
    });
  }
};

export const multipleEnemyTargetRules = {
  canPlay:
    (min: number) =>
    (game: Game, card: AnyCard, predicate: (unit: Unit) => boolean = () => true) => {
      return (
        card.player.enemyUnits.filter(
          unit => unit.canBeTargetedBy(card) && predicate(unit)
        ).length > min
      );
    },
  getPreResponseTargets:
    ({ min, max, allowRepeat }: { min: number; max: number; allowRepeat: boolean }) =>
    async (
      game: Game,
      card: AnyCard,
      {
        predicate = () => true,
        getAoe
      }: {
        predicate?: (unit: Unit) => boolean;
        getAoe: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
      }
    ) => {
      return await game.interaction.selectSpacesOnBoard({
        player: card.player,
        getAoe,
        isElligible(candidate, selectedCards) {
          if (!candidate.unit) {
            return false;
          }
          if (card.isAlly(candidate.unit.card)) {
            return false;
          }
          return (
            card.player.enemyUnits.some(enemy => enemy.equals(candidate)) &&
            candidate.unit.canBeTargetedBy(card) &&
            (allowRepeat
              ? true
              : !selectedCards.some(selected => selected.equals(candidate))) &&
            predicate(candidate.unit)
          );
        },
        canCommit(selectedCards) {
          return selectedCards.length >= min;
        },
        isDone(selectedCards) {
          return selectedCards.length === max;
        }
      });
    }
};

export const anywhereTargetRules = {
  canPlay:
    ({ min }: { min: number; max: number }) =>
    (game: Game, card: AnyCard, predicate: (cell: BoardCell) => boolean = () => true) => {
      const allCells = game.boardSystem.cells;
      const elligibleCells = allCells.filter(cell => predicate(cell) && !cell.unit);
      return elligibleCells.length >= min;
    },
  getPreResponseTargets:
    ({ min, max, allowRepeat }: { min: number; max: number; allowRepeat: boolean }) =>
    async (
      game: Game,
      card: AnyCard,
      {
        predicate = () => true,
        getAoe = () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {})
      }: {
        predicate?: (cell: BoardCell) => boolean;
        getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
      } = {}
    ) => {
      return await game.interaction.selectSpacesOnBoard({
        player: card.player,
        getAoe,
        isElligible(candidate, selectedCells) {
          return (
            (allowRepeat
              ? true
              : !selectedCells.some(selected => selected.equals(candidate))) &&
            predicate(candidate)
          );
        },
        canCommit(selectedCards) {
          return selectedCards.length >= min;
        },
        isDone(selectedCards) {
          return selectedCards.length === max;
        }
      });
    }
};

export const emptySpacesTargetRules = {
  canPlay:
    ({ min }: { min: number }) =>
    (game: Game, predicate: (cell: BoardCell) => boolean = () => true) => {
      const allCells = game.boardSystem.cells;
      const elligibleCells = allCells.filter(cell => predicate(cell) && !cell.unit);
      return elligibleCells.length >= min;
    },
  getPreResponseTargets:
    ({ min, max }: { min: number; max: number }) =>
    async (
      game: Game,
      card: AnyCard,
      {
        predicate = () => true,
        getAoe = () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {})
      }: {
        predicate?: (cell: BoardCell) => boolean;
        getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
      } = {}
    ) => {
      return await game.interaction.selectSpacesOnBoard({
        player: card.player,
        getAoe,
        isElligible(candidate, selectedCells) {
          return (
            !candidate.unit &&
            !selectedCells.some(selected => selected.equals(candidate)) &&
            predicate(candidate)
          );
        },
        canCommit(selectedCards) {
          return selectedCards.length >= min;
        },
        isDone(selectedCards) {
          return selectedCards.length === max;
        }
      });
    }
};

export const singleUnitTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: Unit) => boolean = () => true) {
    return (
      [...card.player.units, ...card.player.enemyUnits].filter(
        unit => unit.canBeTargetedBy(card) && predicate(unit)
      ).length > 0
    );
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    {
      required = true,
      predicate = () => true,
      getAoe = () => new PointAOEShape(TARGETING_TYPE.ALLY_UNIT, {})
    }: {
      required?: boolean;
      predicate?: (unit: Unit) => boolean;
      getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
    } = {}
  ) {
    return await game.interaction.selectSpacesOnBoard({
      player: card.player,
      getAoe,
      isElligible(candidate, selectedCells) {
        if (!candidate.unit) {
          return false;
        }

        return (
          candidate.unit.canBeTargetedBy(card) &&
          !selectedCells.some(selected => selected.equals(candidate)) &&
          predicate(candidate.unit)
        );
      },
      canCommit(selectedCards) {
        return required ? selectedCards.length === 1 : true;
      },
      isDone(selectedCards) {
        return selectedCards.length === 1;
      }
    });
  }
};
