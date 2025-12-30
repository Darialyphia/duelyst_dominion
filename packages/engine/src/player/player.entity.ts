import {
  CardManagerComponent,
  type DeckCard
} from '../card/components/card-manager.component';
import { Entity } from '../entity';
import { type Game } from '../game/game';
import { type Nullable, type Serializable } from '@game/shared';
import { ArtifactManagerComponent } from './components/artifact-manager.component';
import type { AnyCard } from '../card/entities/card.entity';
import { CardTrackerComponent } from './components/cards-tracker.component';
import { Interceptable } from '../utils/interceptable';
import { GAME_EVENTS } from '../game/game.events';
import {
  PlayerAfterEarnVictoryPointsEvent,
  PlayerAfterReplaceCardEvent,
  PlayerBeforeEarnVictoryPointsEvent,
  PlayerBeforeReplaceCardEvent,
  PlayerManaChangeEvent,
  PlayerPlayCardEvent,
  PlayerTurnEvent
} from './player.events';
import { ModifierManager } from '../modifier/modifier-manager.component';
import type { GeneralCard } from '../card/entities/general-card.entity';
import type { Unit } from '../unit/unit.entity';
import { PLAYER_EVENTS } from './player.enums';
import { CardNotFoundError } from '../card/card-errors';
import { CARD_EVENTS, CARD_KINDS } from '../card/card.enums';
import { match } from 'ts-pattern';
import type { SerializedPlayerArtifact } from './player-artifact.entity';

export type PlayerOptions = {
  id: string;
  name: string;
  deck: { cards: { blueprintId: string; isFoil: boolean }[] };
};

export type SerializedPlayer = {
  id: string;
  entityType: 'player';
  name: string;
  hand: string[];
  handSize: number;
  discardPile: string[];
  remainingCardsInDeck: string[];
  remainingCountInDeck: number;
  isPlayer1: boolean;
  maxHp: number;
  currentHp: number;
  currentMana: number;
  maxMana: number;
  deckSize: number;
  canReplace: boolean;
  isActive: boolean;
  equipedArtifacts: string[];
  currentlyPlayedCard: string | null;
  victoryPoints: number;
  canUseResourceAction: boolean;
  artifacts: SerializedPlayerArtifact[];
};

export type PlayerInterceptor = {
  cardsDrawnForTurn: Interceptable<number>;
  maxReplacesPerTurn: Interceptable<number>;
  maxManathreshold: Interceptable<number>;
  maxMana: Interceptable<number>;
};
const makeInterceptors = (): PlayerInterceptor => {
  return {
    cardsDrawnForTurn: new Interceptable<number>(),
    maxReplacesPerTurn: new Interceptable<number>(),
    maxMana: new Interceptable<number>(),
    maxManathreshold: new Interceptable<number>()
  };
};

export class Player
  extends Entity<PlayerInterceptor>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  readonly cardManager: CardManagerComponent;

  readonly modifiers: ModifierManager<Player>;

  readonly artifactManager: ArtifactManagerComponent;

  readonly cardTracker: CardTrackerComponent;

  private _general!: Unit;

  currentlyPlayedCard: Nullable<DeckCard> = null;

  currentlyPlayedCardIndexInHand: Nullable<number> = null;

  private _replacesDoneThisTurn = 0;

  private _victoryPoints = 0;

  private _mana = 0;

  private _baseMaxMana = 0;

  private _resourceActionsDoneThisTurn = 0;

  constructor(
    game: Game,
    private options: PlayerOptions
  ) {
    super(options.id, makeInterceptors());
    this.game = game;
    this.cardTracker = new CardTrackerComponent(game, this);
    this.cardManager = new CardManagerComponent(game, this, {
      deck: this.options.deck.cards.filter(card => {
        const blueprint = this.game.cardSystem.getBlueprint(card.blueprintId);
        return blueprint.kind !== CARD_KINDS.GENERAL;
      }),
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: true
    });
    this.modifiers = new ModifierManager<Player>(this);
    this.artifactManager = new ArtifactManagerComponent(game, this);
  }

  async init() {
    this._baseMaxMana = this.isPlayer1
      ? this.game.config.PLAYER_1_INITIAL_MANA
      : this.game.config.PLAYER_2_INITIAL_MANA;
    this._mana = this._baseMaxMana;

    const generalId = this.options.deck.cards.find(card => {
      const blueprint = this.game.cardSystem.getBlueprint(card.blueprintId);
      return blueprint.kind === CARD_KINDS.GENERAL;
    });
    if (!generalId) {
      throw new Error(`General card not found in player's deck`);
    }
    const generalCard = await this.generateCard<GeneralCard>(
      generalId.blueprintId,
      generalId.isFoil
    );
    await generalCard.play();

    this._general = this.game.unitSystem.getUnitByCard(generalCard)!;
    await this.cardManager.init();
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'player' as const,
      name: this.options.name,
      hand: this.cardManager.hand.map(card => card.id),
      handSize: this.cardManager.hand.length,
      discardPile: [...this.cardManager.discardPile].map(card => card.id),
      banishPile: [...this.cardManager.banishPile].map(card => card.id),
      destinyZone: [...this.cardManager.destinyZone].map(card => card.id),
      remainingCardsInDeck: [...this.cardManager.deck.cards]
        .sort((a, b) => {
          if (a.manaCost === b.manaCost) {
            return a.blueprint.name.localeCompare(b.blueprint.name);
          }
          return a.manaCost - b.manaCost;
        })
        .map(card => card.id),
      remainingCountInDeck: this.cardManager.deck.cards.length,
      isPlayer1: this.isPlayer1,
      maxHp: this._general.maxHp,
      currentHp: this._general.remainingHp,
      currentMana: this._mana,
      maxMana: this.maxMana,
      deckSize: this.cardManager.deck.cards.length,
      canReplace: this.canReplaceCard(),
      isActive: this.isActive,
      equipedArtifacts: this.artifactManager.artifacts.map(artifact => artifact.id),
      currentlyPlayedCard: this.currentlyPlayedCard?.id ?? null,
      victoryPoints: this._victoryPoints,
      canUseResourceAction: this.canPerformResourceAction,
      artifacts: this.artifactManager.artifacts.map(artifact => artifact.serialize())
    };
  }

  get victoryPoints() {
    return this._victoryPoints;
  }

  async earnVictoryPoints(amount: number) {
    if (amount <= 0) return;

    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_EARN_VICTORY_POINTS,
      new PlayerBeforeEarnVictoryPointsEvent({ player: this, amount })
    );

    this._victoryPoints += amount;

    return this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_EARN_VICTORY_POINTS,
      new PlayerAfterEarnVictoryPointsEvent({ player: this, amount })
    );
  }

  get isCurrentPlayer() {
    return this.game.gamePhaseSystem.turnPlayer.equals(this);
  }

  get cardsDrawnForTurn() {
    const isFirstTurn = this.game.gamePhaseSystem.elapsedTurns === 0;

    if (isFirstTurn) {
      return this.interceptors.cardsDrawnForTurn.getValue(
        this.game.gamePhaseSystem.turnPlayer.isPlayer1
          ? this.game.config.PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN
          : this.game.config.PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN,
        {}
      );
    }

    return this.interceptors.cardsDrawnForTurn.getValue(
      this.game.config.CARDS_DRAWN_PER_TURN,
      {}
    );
  }

  get isPlayer1() {
    return this.game.playerSystem.player1.equals(this);
  }

  get isActive() {
    return this.game.gamePhaseSystem.turnPlayer.equals(this);
  }

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  get general() {
    return this._general;
  }

  get enemyHero() {
    return this.opponent.general;
  }

  get minions() {
    return this.game.unitSystem
      .getUnitsByPlayer(this)
      .filter(unit => unit.card.kind === CARD_KINDS.MINION);
  }

  get units() {
    return [this.general, ...this.minions];
  }

  get enemyUnits() {
    return [this.enemyHero, ...this.enemyMinions];
  }

  get enemyMinions() {
    return this.opponent.minions;
  }

  get isTurnPlayer() {
    return this.game.gamePhaseSystem.turnPlayer.equals(this);
  }

  get influence() {
    return this.cardManager.hand.length + this.cardManager.destinyZone.size;
  }

  get canPerformResourceAction() {
    return (
      this._resourceActionsDoneThisTurn < this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN
    );
  }

  refillMana() {
    this._mana = this.maxMana;
  }

  get maxManathreshold() {
    return this.interceptors.maxManathreshold.getValue(this.game.config.MAX_MANA, {});
  }

  async startTurn() {
    await this.game.emit(
      GAME_EVENTS.PLAYER_START_TURN,
      new PlayerTurnEvent({ player: this })
    );

    this._replacesDoneThisTurn = 0;
    this._resourceActionsDoneThisTurn = 0;

    if (this.game.gamePhaseSystem.elapsedTurns > 0) {
      this._baseMaxMana = Math.min(
        this._baseMaxMana + this.game.config.MAX_MANA_INCREASE_PER_TURN,
        this.maxManathreshold
      );
    }
    this.refillMana();

    if (this.game.config.DRAW_STEP === 'turn-start') {
      await this.drawForTurn();
    }

    for (const unit of this.units) {
      if (unit.shouldActivateOnTurnStart) {
        unit.activate();
      }
    }
  }

  async endTurn() {
    if (this.game.config.DRAW_STEP === 'turn-end') {
      await this.drawForTurn();
    }

    await this.game.emit(
      GAME_EVENTS.PLAYER_END_TURN,
      new PlayerTurnEvent({ player: this })
    );
  }

  get mana() {
    return this._mana;
  }

  get maxMana() {
    return this.interceptors.maxMana.getValue(this._baseMaxMana, {});
  }

  async spendMana(amount: number) {
    if (amount === 0) return;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
    this._mana = Math.max(this._mana - amount, 0);
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
  }

  async gainMana(amount: number) {
    if (amount === 0) return;
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
    this._mana = this._mana + amount; // dont clamp to max mana because of effects that go over max mana (ex: mana tile)
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ player: this, amount })
    );
  }

  gainMaxMana(amount: number) {
    this._baseMaxMana = Math.min(this._baseMaxMana + amount, this.maxManathreshold);
  }

  loseMaxMana(amount: number) {
    this._baseMaxMana = Math.max(0, this._baseMaxMana - amount);
    if (this._mana > this.maxMana) {
      this._mana = this.maxMana;
    }
  }

  canSpendMana(amount: number) {
    return this.mana >= amount;
  }

  get maxReplacesPerTurn() {
    return this.interceptors.maxReplacesPerTurn.getValue(
      this.game.config.MAX_REPLACES_PER_TURN,
      {}
    );
  }

  canReplaceCard() {
    return this._replacesDoneThisTurn < this.maxReplacesPerTurn;
  }

  async replaceCard(index: number) {
    const card = this.cardManager.hand[index];
    if (!card) {
      throw new CardNotFoundError();
    }

    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_REPLACE_CARD,
      new PlayerBeforeReplaceCardEvent({ card })
    );

    const replacement = this.cardManager.replaceCardAt(index);
    this._replacesDoneThisTurn++;

    await this.game.emit(
      PLAYER_EVENTS.PLAYER_AFTER_REPLACE_CARD,
      new PlayerAfterReplaceCardEvent({ card, replacement })
    );
  }

  generateCard<T extends AnyCard = AnyCard>(
    blueprintId: string,
    isFoil: boolean
  ): Promise<T> {
    const card = this.game.cardSystem.addCard<T>(this, blueprintId, isFoil);

    return card;
  }

  async playCardAtIndex(index: number) {
    const card = this.cardManager.hand[index];
    if (!card) return;

    await this.playCardFromHand(card);
  }

  private async onBeforePlayFromHand(card: DeckCard) {
    await this.game.emit(
      PLAYER_EVENTS.PLAYER_BEFORE_PLAY_CARD,
      new PlayerPlayCardEvent({ player: this, card })
    );
    await this.spendMana(card.manaCost);
  }

  playCardFromHand(card: DeckCard) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<{ cancelled: boolean }>(async resolve => {
      this.currentlyPlayedCard = card;
      this.currentlyPlayedCardIndexInHand = this.cardManager.hand.indexOf(card);
      const stop = card.once(
        CARD_EVENTS.CARD_BEFORE_PLAY,
        this.onBeforePlayFromHand.bind(this, card)
      );
      await card.play(async () => {
        this.currentlyPlayedCard = null;
        this.currentlyPlayedCardIndexInHand = null;
        resolve({ cancelled: true });
      });
      await this.game.emit(
        PLAYER_EVENTS.PLAYER_AFTER_PLAY_CARD,
        new PlayerPlayCardEvent({ player: this, card })
      );
      stop();
      this.currentlyPlayedCard = null;
      this.currentlyPlayedCardIndexInHand = null;
      resolve({ cancelled: false });
    });
  }

  async drawForTurn() {
    await this.cardManager.drawFromDeck(this.cardsDrawnForTurn);
  }
}
