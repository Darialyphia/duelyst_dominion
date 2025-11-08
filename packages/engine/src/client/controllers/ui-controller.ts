import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { CardViewModel } from '../view-models/card.model';
import type { GameClientState } from './state-controller';
import { CancelPlayCardGlobalAction } from '../actions/cancel-play-card';
import type { UnitViewModel } from '../view-models/unit.model';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { MoveUnitAction } from '../actions/move-unit';
import { SelectSpaceOnBoardAction } from '../actions/select-space-on-board';
import { SelectUnitAction } from '../actions/select-unit';
import { UnselectUnitAction } from '../actions/unselect-unit';
import { CaptureShrineAction } from '../actions/capture-shrine.action';

export type CardClickRule = {
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  handler: (card: CardViewModel) => void;
};

export type BoardCellClickRule = {
  predicate: (tile: BoardCellViewModel, state: GameClientState) => boolean;
  handler: (tile: BoardCellViewModel, e: MouseEvent) => void;
};

export type GlobalActionRule = {
  id: string;
  shouldDisplay: (state: GameClientState) => boolean;
  shouldBeDisabled: (state: GameClientState) => boolean;
  onClick: () => void;
  getLabel(state: GameClientState): string;
  variant: 'primary' | 'error' | 'info';
};

export type UiOptimisticState = {
  playedCardId: string | null;
};

export class DOMSelector {
  constructor(
    readonly id: string,
    private readonly selectorPrefix: string = ''
  ) {}

  get selector() {
    return `${this.selectorPrefix} #${this.id}`;
  }

  get element() {
    return document.querySelector(this.selector) as HTMLElement | null;
  }
}

export class UiController {
  private _hoveredCell: BoardCellViewModel | null = null;

  private _selectedCard: CardViewModel | null = null;

  private _selectedUnit: UnitViewModel | null = null;

  isHandExpanded = false;

  isPassConfirmationModalOpened = false;

  shouldBypassConfirmation = false;

  isOpponentHandExpanded = false;

  private cardClickRules: CardClickRule[] = [];

  private globalActionRules: GlobalActionRule[] = [];

  private boardCellClickRules: BoardCellClickRule[] = [];

  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  optimisticState: UiOptimisticState = {
    playedCardId: null
  };

  DOMSelectors = {
    board: new DOMSelector('board'),
    effectChain: new DOMSelector('effect-chain'),
    playedCardZone: new DOMSelector('played-card'),
    heroHealthIndicator: (playerId: string) =>
      new DOMSelector(`hero-health-indicator-${playerId}`),
    hand: (playerId: string) => new DOMSelector(`hand-${playerId}`),
    destinyZone: (playerId: string) => new DOMSelector(`destiny-zone-${playerId}`),
    discardPile: (playerId: string) => new DOMSelector(`discard-pile-${playerId}`),
    banishPile: (playerId: string) => new DOMSelector(`banish-pile-${playerId}`),
    destinyDeck: (playerId: string) => new DOMSelector(`destiny-deck-${playerId}`),
    cardOnBoard: (cardId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.board.selector),
    cardInHand: (cardId: string, playerId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.hand(playerId).selector),
    cardInEffectChain: (cardId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.effectChain.selector),
    cardInDestinyZone: (cardId: string, playerId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.destinyZone(playerId).selector),
    hero: (playerId: string) => new DOMSelector(`${playerId}-hero-sprite`),
    cardAction: (cardId: string, actionId: string) =>
      new DOMSelector(`${cardId}-action-${actionId}`),
    frontRow: (playerId: string) => new DOMSelector(`${playerId}-front-row`),
    backRow: (playerId: string) => new DOMSelector(`${playerId}-back-row`),
    actionButton: (actionId: string) => new DOMSelector(`action-button-${actionId}`),
    globalActionButtons: new DOMSelector('global-action-buttons')
  };

  displayedElements = {
    hand: true,
    playerInfos: true,
    artifacts: true,
    unlockedDestinyCards: true,
    destinyZone: true,
    actionButtons: true,
    destinyPhaseModal: true,
    phaseTracker: true,
    attackZone: true,
    defenseZone: true
  };

  highlightedElement: HTMLElement | null = null;

  selectedManaCostIndices: number[] = [];

  constructor(private client: GameClient) {
    this.buildCardClickRules();
    this.buildBoardCellClickRules();
    this.buildGlobalActionRules();
  }

  get hoveredCell() {
    return this._hoveredCell;
  }

  get selectedCard() {
    return this._selectedCard;
  }

  get selectedUnit() {
    return this._selectedUnit;
  }

  get playedCardId() {
    if (this.client.state.phase.state !== GAME_PHASES.PLAYING_CARD) return null;
    if (this.client.playerId !== this.client.state.interaction.ctx.player) return null;

    return this.client.state.phase.ctx.card;
  }

  private buildCardClickRules() {
    this.cardClickRules = [];
  }

  private buildBoardCellClickRules() {
    this.boardCellClickRules = [
      new MoveUnitAction(this.client),
      new SelectSpaceOnBoardAction(this.client),
      new SelectUnitAction(this.client),
      new CaptureShrineAction(this.client),
      new UnselectUnitAction(this.client)
    ];
  }

  private buildGlobalActionRules() {
    this.globalActionRules = [
      new CancelPlayCardGlobalAction(this.client)
      // new CommitMinionSlotSelectionGlobalAction(this.client),
      // new CommitCardSelectionGlobalAction(this.client),
      // new PassGlobalAction(this.client)
    ];
  }

  get globalActions() {
    return this.globalActionRules
      .filter(rule => rule.shouldDisplay(this.client.state))
      .map(rule => {
        return {
          id: rule.id,
          label: rule.getLabel(this.client.state),
          isDisabled: rule.shouldBeDisabled(this.client.state),
          variant: rule.variant,
          onClick: () => {
            rule.onClick();
          }
        };
      });
  }

  onCardClick(card: CardViewModel) {
    const state = this.client.state;
    for (const rule of this.cardClickRules) {
      if (rule.predicate(card, state)) {
        rule.handler(card);
        return;
      }
    }

    this.unselectCard();
  }

  onBoardCellClick(cell: BoardCellViewModel, event: MouseEvent) {
    const state = this.client.state;
    for (const rule of this.boardCellClickRules) {
      if (rule.predicate(cell, state)) {
        rule.handler(cell, event);
        return;
      }
    }
  }

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  clearOptimisticState() {
    this.optimisticState.playedCardId = null;
  }

  update() {
    this.clearOptimisticState();
    if (this.selectedUnit?.isExhausted) {
      this.unselectUnit();
    }
  }

  hover(cell: BoardCellViewModel) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.hoverTimeout = setTimeout(() => {
      this._hoveredCell = cell;
    }, 200);
  }

  unhover() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    this._hoveredCell = null;
  }

  selectCard(card: CardViewModel) {
    this._selectedCard = card;
  }

  unselectCard() {
    this._selectedCard = null;
  }

  selectUnit(unit: UnitViewModel) {
    this._selectedUnit = unit;
  }

  unselectUnit() {
    this._selectedUnit = null;
  }

  getPlayedCardZoneDOMSelector() {
    return `#played-card`;
  }

  getDestinyZoneDOMSelector(playerId: string) {
    return `#destiny-zone-${playerId}`;
  }

  getCardDOMSelector(cardId: string) {
    return `#${cardId}`;
  }

  getCardDOMSelectorInPLayedCardZone(cardId: string) {
    return `${this.getPlayedCardZoneDOMSelector()} ${this.getCardDOMSelector(cardId)}`;
  }

  getCardDOMSelectorInDestinyZone(cardId: string, playerId: string) {
    return `${this.getDestinyZoneDOMSelector(playerId)} ${this.getCardDOMSelector(cardId)}`;
  }

  get explainerMessage() {
    const activePlayerId = this.client.getActivePlayerId();
    const state = this.client.state;

    if (activePlayerId !== this.client.playerId) {
      return 'Waiting for opponent...';
    }

    if (state.interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return 'Select targets';
    }

    return '';
  }
}
