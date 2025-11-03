import type { SerializedArtifactCard } from '../../card/entities/artifact-card.entity';
import type { SerializedCard } from '../../card/entities/card.entity';
import type { SerializedSpellCard } from '../../card/entities/spell-card.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { PlayerViewModel } from './player.model';
import type { ModifierViewModel } from './modifier.model';
import type { GameClientState } from '../controllers/state-controller';
import { PlayCardAction } from '../actions/play-card';
import type { CardKind } from '../../card/card.enums';
import type { SerializedMinionCard } from '../../card/entities/minion-card.entity';
import type { SerializedGeneralCard } from '../../card/entities/general-card.entity';

type CardData =
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedGeneralCard
  | SerializedMinionCard;

export type CardActionRule = {
  id: string;
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  getLabel: (card: CardViewModel) => string;
  handler: (card: CardViewModel) => void;
};

export class CardViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedCard,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: CardViewModel | SerializedCard) {
    return this.id === unit.id;
  }

  update<T extends CardKind>(data: Partial<CardData & { kind: T }>) {
    Object.assign(this.data, data);

    return this;
  }

  clone() {
    return new CardViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get imagePath() {
    return `/assets/icons/${this.data.cardIconId}.png`;
  }

  get kind() {
    return this.data.kind;
  }

  get rarity() {
    return this.data.rarity;
  }

  get manaCost() {
    if ('manaCost' in this.data) {
      return this.data.manaCost as number;
    }
    return null;
  }

  get baseManaCost() {
    if ('baseManaCost' in this.data) {
      return this.data.baseManaCost as number;
    }
    return null;
  }

  get destinyCost() {
    if ('destinyCost' in this.data) {
      return this.data.destinyCost as number;
    }

    return null;
  }

  get baseDestinyCost() {
    if ('baseDestinyCost' in this.data) {
      return this.data.baseDestinyCost as number;
    }

    return null;
  }

  get location() {
    return this.data.location;
  }

  get atk() {
    if ('atk' in this.data) {
      return this.data.atk as number;
    }

    return null;
  }

  get baseAtk() {
    if ('baseAtk' in this.data) {
      return this.data.baseAtk as number;
    }
    return null;
  }

  get maxHp() {
    if ('maxHp' in this.data) {
      return this.data.maxHp as number;
    }

    return null;
  }

  get baseMaxHp() {
    if ('baseMaxHp' in this.data) {
      return this.data.baseMaxHp as number;
    }

    return null;
  }

  get hp() {
    if ('remainingHp' in this.data) {
      return this.data.remainingHp as number;
    }

    return null;
  }

  get level() {
    if ('level' in this.data) {
      return this.data.level as number;
    }

    return null;
  }

  get spellpower() {
    if ('spellPower' in this.data) {
      return this.data.spellPower as number;
    }

    return null;
  }

  get baseSpellpower() {
    if ('baseSpellPower' in this.data) {
      return this.data.baseSpellPower as number;
    }
    return null;
  }

  get durability() {
    if ('durability' in this.data) {
      return this.data.durability as number;
    }

    return null;
  }

  get canPlay() {
    return this.data.canPlay;
  }

  get indexInHand() {
    if (this.data.location !== 'hand') {
      return null;
    }

    return this.getPlayer()
      .getHand()
      .findIndex(card => card.equals(this));
  }

  getPlayer() {
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }

  getModifiers() {
    return this.data.modifiers.map(modifierId => {
      return this.getEntities()[modifierId] as ModifierViewModel;
    });
  }

  play() {
    const player = this.getPlayer();
    const hand = player.getHand();

    const index = hand.findIndex(card => card.equals(this));
    if (index === -1) return;

    player.playCard(index);
  }

  getActions(): CardActionRule[] {
    return [new PlayCardAction(this.getClient())].filter(rule => rule.predicate(this));
  }
}
