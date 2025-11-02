import { Vec2, type Point, type Serializable } from '@game/shared';
import type { GeneralCard } from '../card/entities/general-card.entity';
import type { MinionCard } from '../card/entities/minion-card.entity';
import type { Game } from '../game/game';
import { EntityWithModifiers } from '../entity';
import { MovementComponent } from './components/movement.component';
import { PathfinderComponent } from '../pathfinding/pathfinder.component';
import { SolidBodyPathfindingStrategy } from '../pathfinding/strategies/solid-pathfinding.strategy';
import { Interceptable } from '../utils/interceptable';
import type { AnyCard } from '../card/entities/card.entity';
import type { Modifier } from '../modifier/modifier.entity';
import { CARD_KINDS } from '../card/card.enums';
import {
  TARGETING_TYPE,
  type TargetingStrategy,
  type TargetingType
} from '../targeting/targeting-strategy';
import type { AOEShape } from '../aoe/aoe-shapes';
import { Player } from '../player/player.entity';
import type { Damage } from '../utils/damage';
import {
  SingleCounterAttackParticipantStrategy,
  type CounterAttackParticipantStrategy
} from './counterattack-participants';
import { CombatComponent } from './components/combat.component';
import { UNIT_EVENTS } from './unit.enums';
import {
  UnitAfterDestroyEvent,
  UnitAfterMoveEvent,
  UnitBeforeDestroyEvent,
  UnitBeforeMoveEvent
} from './unit-events';

export type UnitOptions = {
  id: string;
  position: Point;
};

export type SerializedUnit = {
  id: string;
  entityType: 'unit';
  card: string;
  position: Point;
  baseAtk: number;
  atk: number;
  isGeneral: boolean;
  baseMaxHp: number;
  maxHp: number;
  currentHp: number;
  isFullHp: boolean;
  player: string;
  keywords: Array<{ id: string; name: string; description: string }>;
  isExhausted: boolean;
  isDead: boolean;
  moveZone: string[];
  dangerZone: string[];
  attackableCells: string[];
  modifiers: string[];
};

export type UnitInterceptors = {
  canMove: Interceptable<boolean>;
  canMoveThrough: Interceptable<boolean, { unit: Unit }>;
  canMoveAfterAttacking: Interceptable<boolean>;
  canAttack: Interceptable<boolean, { unit: Unit }>;
  canCounterAttack: Interceptable<boolean, { attacker: Unit }>;
  canBeAttackTarget: Interceptable<boolean, { attacker: Unit }>;
  canBeCounterattackTarget: Interceptable<boolean, { attacker: Unit }>;
  canBeCardTarget: Interceptable<boolean, { card: AnyCard }>;
  canBeDestroyed: Interceptable<boolean>;
  canReceiveModifier: Interceptable<boolean, { modifier: Modifier<Unit> }>;

  shouldDeactivateWhenSummoned: Interceptable<boolean>;

  maxHp: Interceptable<number>;
  atk: Interceptable<number>;
  speed: Interceptable<number>;

  attackTargetingPattern: Interceptable<TargetingStrategy>;
  attackTargetType: Interceptable<TargetingType>;
  attackAOEShape: Interceptable<AOEShape>;
  attackCounterattackParticipants: Interceptable<CounterAttackParticipantStrategy>;

  counterattackTargetingPattern: Interceptable<TargetingStrategy>;
  counterattackTargetType: Interceptable<TargetingType>;
  counterattackAOEShape: Interceptable<AOEShape>;

  maxAttacksPerTurn: Interceptable<number>;
  maxMovementsPerTurn: Interceptable<number>;
  maxCounterattacksPerTurn: Interceptable<number>;

  player: Interceptable<Player>;

  damageDealt: Interceptable<number, { source: AnyCard; target: Unit }>;
  damageReceived: Interceptable<
    number,
    { amount: number; source: AnyCard; damage: Damage }
  >;
};

export class Unit
  extends EntityWithModifiers<UnitInterceptors>
  implements Serializable<SerializedUnit>
{
  movement: MovementComponent;

  combat: CombatComponent;

  private damageTaken = 0;

  _isExhausted = false;

  constructor(
    private game: Game,
    readonly card: MinionCard | GeneralCard,
    options: UnitOptions
  ) {
    super(options.id, {
      canMove: new Interceptable(),
      canMoveAfterAttacking: new Interceptable(),
      canMoveThrough: new Interceptable(),
      canAttack: new Interceptable(),
      canCounterAttack: new Interceptable(),
      canBeAttackTarget: new Interceptable(),
      canBeCounterattackTarget: new Interceptable(),
      canBeCardTarget: new Interceptable(),
      canBeDestroyed: new Interceptable(),
      canReceiveModifier: new Interceptable<boolean, { modifier: Modifier<Unit> }>(),

      shouldDeactivateWhenSummoned: new Interceptable<boolean>(),

      maxHp: new Interceptable<number>(),
      atk: new Interceptable<number>(),
      speed: new Interceptable<number>(),

      attackTargetingPattern: new Interceptable<TargetingStrategy>(),
      attackTargetType: new Interceptable<TargetingType>(),
      attackAOEShape: new Interceptable<AOEShape>(),
      attackCounterattackParticipants: new Interceptable(),

      counterattackTargetingPattern: new Interceptable(),
      counterattackTargetType: new Interceptable(),
      counterattackAOEShape: new Interceptable(),

      maxAttacksPerTurn: new Interceptable(),
      maxMovementsPerTurn: new Interceptable(),
      maxCounterattacksPerTurn: new Interceptable(),

      player: new Interceptable<Player>(),

      damageDealt: new Interceptable<number, { source: AnyCard; target: Unit }>(),
      damageReceived: new Interceptable<
        number,
        { amount: number; source: AnyCard; damage: Damage }
      >()
    });
    this.movement = new MovementComponent(game, this, {
      position: options.position,
      pathfinding: new PathfinderComponent(
        game,
        new SolidBodyPathfindingStrategy(this.game, this)
      )
    });

    this.combat = new CombatComponent(game, this);
  }

  get player() {
    return this.card.player!;
  }

  get isGeneral() {
    return this.card.kind === CARD_KINDS.GENERAL;
  }

  get isMinion() {
    return this.card.kind === CARD_KINDS.MINION;
  }

  get position() {
    return this.movement.position;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get speed() {
    return this.interceptors.speed.getValue(this.game.config.DEFAULT_UNIT_SPEED, {});
  }

  get isAt() {
    return this.movement.isAt.bind(this.movement);
  }

  isEnemy(entity: Unit | Player) {
    if (entity instanceof Player) {
      return !this.player.equals(entity);
    }
    return !this.player.equals(entity.player);
  }

  isAlly(entity: Unit | Player) {
    return !this.isEnemy(entity);
  }

  get maxMovementsPerTurn() {
    return this.interceptors.maxMovementsPerTurn.getValue(
      this.game.config.MAX_MOVEMENT_PER_TURN,
      {}
    );
  }

  get maxAttacksPerTurn() {
    return this.interceptors.maxAttacksPerTurn.getValue(
      this.game.config.MAX_ATTACKS_PER_TURN,
      {}
    );
  }

  get maxCounterattacksPerTurn() {
    return this.interceptors.maxCounterattacksPerTurn.getValue(
      this.game.config.MAX_COUNTERATTACKS_PER_TURN,
      {}
    );
  }

  get attacksPerformedThisTurn() {
    return this.combat.attacksCount;
  }

  get counterAttacksPerformedThisTurn() {
    return this.combat.counterAttacksCount;
  }

  get movementsMadeThisTurn() {
    return this.movement.movementsCount;
  }

  get canMoveAfterAttacking() {
    return this.interceptors.canMoveAfterAttacking.getValue(false, {});
  }

  get canMove(): boolean {
    return this.interceptors.canMove.getValue(
      this.movementsMadeThisTurn < this.maxMovementsPerTurn &&
        (this.attacksPerformedThisTurn > 0 ? this.canMoveAfterAttacking : true),
      {}
    );
  }

  canMoveThrough(unit: Unit) {
    return this.interceptors.canMoveThrough.getValue(this.isAlly(unit), { unit });
  }

  canMoveTo(point: Point) {
    if (!this.canMove) return false;
    return this.movement.canMoveTo(point, this.speed);
  }

  async move(to: Point) {
    await this.movement.move(to);
    // also check attacks made and increase to always be at least 1 less than moves
    // this enforces celerity rules of not allowing more than one move per attack
    const minAttacks = this.movementsMadeThisTurn - 1;
    if (this.attacksPerformedThisTurn < minAttacks) {
      this.combat.setAttackCount(minAttacks);
    }
  }

  async teleport(to: Point) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_TELEPORT,
      new UnitBeforeMoveEvent({
        unit: this,
        position: this.position,
        path: [this.position, Vec2.fromPoint(to)]
      })
    );
    const prevPosition = this.movement.position.clone();
    this.movement.position.x = to.x;
    this.movement.position.y = to.y;
    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_TELEPORT,
      new UnitAfterMoveEvent({
        unit: this,
        position: this.position,
        previousPosition: prevPosition,
        path: [this.position, Vec2.fromPoint(to)]
      })
    );
  }

  get getPathTo() {
    return this.movement.getPathTo.bind(this.movement);
  }

  getPossibleMoves(max?: number, force = false) {
    if (!this.canMove && !force) return [];
    return this.movement.getAllPossibleMoves(max ?? this.speed).filter(point => {
      const cell = this.game.boardSystem.getCellAt(point)!;
      return cell.isWalkable && !cell.unit;
    });
  }

  get canBeDestroyed(): boolean {
    return this.interceptors.canBeDestroyed.getValue(true, {});
  }

  canAttack(unit: Unit): boolean {
    return this.interceptors.canAttack.getValue(
      this.attacksPerformedThisTurn < this.maxAttacksPerTurn,
      { unit }
    );
  }

  canAttackAt(point: Point) {
    if (this.position.equals(point)) {
      return false;
    }
    const target = this.game.unitSystem.getUnitAt(point);
    if (!target) return false;

    if (!this.canAttack(target) || !target.canBeAttackedBy(this)) {
      return false;
    }

    return this.attackTargettingPattern.canTargetAt(point);
  }

  get isExhausted() {
    if (this.player.isActive) {
      return (
        this.attacksPerformedThisTurn === this.maxAttacksPerTurn &&
        this.movementsMadeThisTurn === this.maxMovementsPerTurn
      );
    } else {
      return this.counterAttacksPerformedThisTurn === this.maxCounterattacksPerTurn;
    }
  }

  canBeAttackedBy(unit: Unit): boolean {
    return this.interceptors.canBeAttackTarget.getValue(this.isAlive, { attacker: unit });
  }

  canBeCounterattackedBy(unit: Unit): boolean {
    return this.interceptors.canBeCounterattackTarget.getValue(this.isAlive, {
      attacker: unit
    });
  }

  canBeTargetedBy(card: AnyCard): boolean {
    return this.interceptors.canBeCardTarget.getValue(this.isAlive, { card });
  }

  get attackTargettingPattern(): TargetingStrategy {
    return this.interceptors.attackTargetingPattern.getValue(this.card.attackPattern, {});
  }

  get attackTargetType(): TargetingType {
    return this.interceptors.attackTargetType.getValue(TARGETING_TYPE.ENEMY_UNIT, {});
  }

  get attackAOEShape(): AOEShape {
    return this.interceptors.attackAOEShape.getValue(this.card.attackAOEShape, {});
  }

  get counterattackTargetingPattern(): TargetingStrategy {
    return this.interceptors.counterattackTargetingPattern.getValue(
      this.card.counterattackPattern,
      {}
    );
  }

  get counterattackTargetType(): TargetingType {
    return this.interceptors.counterattackTargetType.getValue(
      TARGETING_TYPE.ENEMY_UNIT,
      {}
    );
  }

  get counterattackAOEShape(): AOEShape {
    return this.interceptors.counterattackAOEShape.getValue(
      this.card.counterattackAOEShape,
      {}
    );
  }

  getCounterattackParticipants(initialTarget: Unit) {
    return this.interceptors.attackCounterattackParticipants
      .getValue(new SingleCounterAttackParticipantStrategy(), {})
      .getCounterattackParticipants({
        attacker: this,
        initialTarget,
        affectedUnits: this.attackAOEShape.getUnits([initialTarget])
      });
  }

  canCounterAttack(unit: Unit): boolean {
    return this.interceptors.canCounterAttack.getValue(
      this.combat.counterAttacksCount < this.maxCounterattacksPerTurn,
      { attacker: unit }
    );
  }

  canCounterAttackAt(point: Point) {
    if (this.position.equals(point)) {
      return false;
    }

    const target = this.game.unitSystem.getUnitAt(point);
    if (!target) return false;

    return (
      this.canCounterAttack(target) &&
      this.counterattackTargetingPattern.canTargetAt(point)
    );
  }

  get remainingHp() {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  get isAlive() {
    return this.remainingHp > 0;
  }

  getReceivedDamage(damage: Damage, source: AnyCard) {
    return this.interceptors.damageReceived.getValue(damage.baseAmount, {
      damage,
      amount: damage.baseAmount,
      source
    });
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.card.maxHp, {});
  }

  get atk() {
    return this.interceptors.atk.getValue(this.card.atk, {});
  }

  async attack(point: Point) {
    return this.combat.attack(point);
  }

  async counterAttack(unit: Unit) {
    return this.combat.counterAttack(unit);
  }

  get dealDamage() {
    return this.combat.dealDamage.bind(this.combat);
  }

  get takeDamage() {
    return this.combat.takeDamage.bind(this.combat);
  }

  addHp(amount: number) {
    this.damageTaken = Math.max(this.damageTaken - amount, 0);
  }

  removeHp(amount: number) {
    this.damageTaken = Math.min(this.damageTaken + amount, this.maxHp);
  }

  private async checkHp({ source }: { source: AnyCard }) {
    if (!this.isAlive) {
      await this.game.inputSystem.schedule(() => this.destroy(source));
    }
  }

  async removeFromBoard() {
    for (const modifier of this.modifiers.list) {
      await this.modifiers.remove(modifier.id);
    }
    this.game.unitSystem.removeUnit(this);
  }

  async destroy(source: AnyCard) {
    if (!this.canBeDestroyed) return;
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_DESTROY,
      new UnitBeforeDestroyEvent({ source })
    );
    const position = this.position;
    await this.removeFromBoard();
    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_DESTROY,
      new UnitAfterDestroyEvent({ source, destroyedAt: position })
    );
  }

  activate() {
    this.combat.resetAttackCount();
    this.movement.resetMovementsCount();
  }

  canGetInAttackAtFromPosition(point: Point, position: Point) {
    const copy = this.position.clone();
    this.movement.position.x = position.x;
    this.movement.position.y = position.y;
    const canAttack = this.attackTargettingPattern.isWithinRange(point);
    this.movement.position = copy;
    return canAttack;
  }

  serialize() {
    // calculate this upfront as this can be an expensive operation if we call it many times
    // moves the unit could make provided it was able to move
    const potentialMoves = this.getPossibleMoves(this.speed, true).map(
      point => this.game.boardSystem.getCellAt(point)!
    );
    // moves the unit can actually make
    const possibleMoves = this.getPossibleMoves(this.speed).map(
      point => this.game.boardSystem.getCellAt(point)!
    );

    return {
      id: this.id,
      entityType: 'unit' as const,
      card: this.card.id,
      position: this.position.serialize(),
      baseAtk: this.card.blueprint.atk,
      atk: this.atk,
      baseMaxHp: this.card.blueprint.maxHp,
      maxHp: this.maxHp,
      currentHp: this.remainingHp,
      isFullHp: this.remainingHp === this.maxHp,
      isGeneral: this.isGeneral,
      player: this.player.id,
      keywords: [],
      isExhausted: this.isExhausted,
      isDead: !this.isAlive,
      moveZone: possibleMoves.map(point => point.id),
      dangerZone: this.game.boardSystem.cells
        .filter(cell =>
          potentialMoves
            .filter(move => cell.isNeighbor(move))
            .some(point => this.canGetInAttackAtFromPosition(cell.position, point))
        )
        .map(cell => cell.id),
      attackableCells: this.game.boardSystem.cells
        .filter(cell => this.canAttackAt(cell.position))
        .map(cell => cell.id),
      modifiers: this.modifiers.list.map(modifier => modifier.id)
    };
  }
}
