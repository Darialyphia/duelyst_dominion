import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { CardViewModel } from '../view-models/card.model';
import type { GameClientState } from './state-controller';
import { CancelPlayCardGlobalAction } from '../actions/cancel-play-card';
import { CommitSpaceSelectionGlobalAction } from '../actions/commit-space-selection';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import type { UnitViewModel } from '../view-models/unit.model';
import { debounce } from 'lodash-es';

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
export class UiController {
  private _hoveredCell: BoardCellViewModel | null = null;

  private _selectedCard: CardViewModel | null = null;

  private _selectedUnit: UnitViewModel | null = null;

  private _isManaCostOverlayOpened = false;

  private _isChooseCardsInteractionOverlayOpened = false;

  private globalActionRules: GlobalActionRule[] = [];

  optimisticState: UiOptimisticState = {
    playedCardId: null
  };

  selectedManaCostIndices: number[] = [];

  constructor(private client: GameClient) {
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

  get isManaCostOverlayOpened() {
    return this._isManaCostOverlayOpened;
  }

  get isChooseCardsInteractionOverlayOpened() {
    return this._isChooseCardsInteractionOverlayOpened;
  }

  get playedCardId() {
    if (this.client.state.interaction.state !== INTERACTION_STATES.PLAYING_CARD)
      return null;
    if (this.client.playerId !== this.client.state.interaction.ctx.player) return null;

    return this.client.state.interaction.ctx.card;
  }

  private buildGlobalActionRules() {
    this.globalActionRules = [
      new CancelPlayCardGlobalAction(this.client),
      new CommitSpaceSelectionGlobalAction(this.client)
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

  get isInteractingPlayer() {
    return this.client.playerId === this.client.state.interaction.ctx.player;
  }

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  clearOptimisticState() {
    this.optimisticState.playedCardId = null;
  }

  update() {
    this._isChooseCardsInteractionOverlayOpened =
      this.isInteractingPlayer &&
      this.client.state.interaction.state === INTERACTION_STATES.CHOOSING_CARDS;

    this._isManaCostOverlayOpened =
      this.isInteractingPlayer &&
      this.client.state.interaction.state === INTERACTION_STATES.PLAYING_CARD;

    if (this.client.state.interaction.state !== INTERACTION_STATES.PLAYING_CARD) {
      this.selectedManaCostIndices = [];
    }

    this.clearOptimisticState();
  }

  hoverAt(cell: BoardCellViewModel) {
    this._hoveredCell = cell;
  }

  unhover() {
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

  getHandDOMSelector(playerId: string) {
    return `#hand-${playerId}`;
  }

  getBoardDOMSelector() {
    return '#board';
  }

  getPlayedCardZoneDOMSelector() {
    return `#played-card`;
  }

  getCardDOMSelector(cardId: string) {
    return `#${cardId}`;
  }

  getCardDOMSelectorOnBoard(cardId: string) {
    return `${this.getBoardDOMSelector()} ${this.getCardDOMSelector(cardId)}`;
  }

  getCardDOMSelectorInHand(cardId: string, playerId: string) {
    return `${this.getHandDOMSelector(playerId)} ${this.getCardDOMSelector(cardId)}`;
  }

  getCardDOMSelectorInPLayedCardZone(cardId: string) {
    return `${this.getPlayedCardZoneDOMSelector()} ${this.getCardDOMSelector(cardId)}`;
  }

  get idleMessage() {
    return 'Waiting for opponent...';
  }

  get explainerMessage() {
    const activePlayerId = this.client.getActivePlayerId();

    if (activePlayerId !== this.client.playerId) {
      return this.idleMessage;
    }

    return '';
  }
}
