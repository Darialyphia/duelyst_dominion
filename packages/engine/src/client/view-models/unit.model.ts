import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedUnit } from '../../unit/unit.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { BoardCellViewModel } from './board-cell.model';
import type { CardViewModel } from './card.model';
import type { ModifierViewModel } from './modifier.model';
import type { PlayerViewModel } from './player.model';

export class UnitViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedUnit,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: UnitViewModel | SerializedUnit) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    Object.assign(this.data, data);

    return this;
  }

  clone() {
    return new UnitViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get position() {
    return this.data.position;
  }

  get x() {
    return this.data.position.x;
  }

  get y() {
    return this.data.position.y;
  }

  get isGeneral() {
    return this.data.isGeneral;
  }

  get isExhausted() {
    return this.data.isExhausted;
  }

  get baseMaxHp() {
    return this.data.baseMaxHp;
  }

  get maxHp() {
    return this.data.maxHp;
  }

  get hp() {
    return this.data.currentHp;
  }

  get baseAtk() {
    return this.data.baseAtk;
  }

  get atk() {
    return this.data.atk;
  }

  get baseCmd() {
    return this.data.baseCmd;
  }

  get cmd() {
    return this.data.cmd;
  }

  get dangerZone() {
    return this.data.dangerZone;
  }

  get cardId() {
    return this.data.card;
  }

  getCard() {
    return this.getEntities()[this.data.card] as CardViewModel;
  }

  canMoveTo(cell: BoardCellViewModel) {
    return this.data.moveZone.includes(cell.id);
  }

  canSprintTo(cell: BoardCellViewModel) {
    if (this.canMoveTo(cell)) return false;

    return this.data.sprintZone.includes(cell.id);
  }

  get attackableCells() {
    return this.data.attackableCells;
  }

  canAttackAt(cell: BoardCellViewModel) {
    return this.data.attackableCells.includes(cell.id);
  }

  isInDangerZone(cell: BoardCellViewModel) {
    return this.data.dangerZone.includes(cell.id);
  }

  getPlayer() {
    const playerId = this.data.player;
    if (!playerId) return null;
    return this.getEntities()[playerId] as PlayerViewModel;
  }

  get modifiers() {
    return this.data.modifiers.map(
      modId => this.getEntities()[modId] as ModifierViewModel
    );
  }
}
