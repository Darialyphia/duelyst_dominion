import { isDefined, Vec2, type Point, type Serializable } from '@game/shared';
import type { GeneralCard } from '../card/entities/general-card.entity';
import type { MinionCard } from '../card/entities/minion-card.entity';
import type { Game } from '../game/game';
import { EntityWithModifiers } from '../utils/entity-with-modifiers';
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
import type { GenericAOEShape } from '../aoe/aoe-shape';
import { Player } from '../player/player.entity';
import type { Damage } from '../utils/damage';
import {
  SingleCounterAttackParticipantStrategy,
  type CounterAttackParticipantStrategy
} from './counterattack-participants';
import { CombatComponent } from './components/combat.component';
import { UNIT_EVENTS } from './unit.enums';
import {
  UnitAfterBounceEvent,
  UnitAfterDestroyEvent,
  UnitAfterHealEvent,
  UnitAfterMoveEvent,
  UnitBeforeBounceEvent,
  UnitBeforeDestroyEvent,
  UnitBeforeHealEvent,
  UnitBeforeMoveEvent
} from './unit-events';
import type { Shrine } from '../board/entities/shrine.entity';
import type { PathfindingStrategy } from '../pathfinding/strategies/pathinding-strategy';
import type { BoardCell } from '../board/entities/board-cell.entity';
import { isGeneral } from '../card/card-utils';

export type UnitOptions = {
  id: string;
  position: Point;
};

export type SerializedUnit = {
  id: string;
  entityType: 'unit';
  card: string;
  isGeneral: boolean;
  position: Point;
  baseAtk: number;
  atk: number;
  baseMaxHp: number;
  cmd: number;
  baseCmd: number;
  maxHp: number;
  currentHp: number;
  isFullHp: boolean;
  player: string;
  keywords: Array<{ id: string; name: string; description: string }>;
  isExhausted: boolean;
  isDead: boolean;
  moveZone: string[];
  sprintZone: string[];
  dangerZone: string[];
  attackableCells: string[];
  modifiers: string[];
  capturableShrines: string[];
};

export type UnitInterceptors = {
  canMove: Interceptable<boolean>;
  canMoveAfterAttacking: Interceptable<boolean>;
  canAttack: Interceptable<boolean, { target: Unit }>;
  canCounterAttack: Interceptable<boolean, { attacker: Unit }>;
  canBeAttackTarget: Interceptable<boolean, { attacker: Unit }>;
  canBeCounterattackTarget: Interceptable<boolean, { attacker: Unit }>;
  canBeCardTarget: Interceptable<boolean, { card: AnyCard }>;
  canBeDestroyed: Interceptable<boolean>;
  canReceiveModifier: Interceptable<boolean, { modifier: Modifier<Unit> }>;
  canCapture: Interceptable<boolean, { shrine: Shrine }>;

  maxHp: Interceptable<number>;
  atk: Interceptable<number>;
  cmd: Interceptable<number>;
  movementReach: Interceptable<number>;
  sprintReach: Interceptable<number>;

  attackTargetingPattern: Interceptable<TargetingStrategy>;
  attackTargetType: Interceptable<TargetingType>;
  attackAOEShape: Interceptable<GenericAOEShape>;
  attackCounterattackParticipants: Interceptable<CounterAttackParticipantStrategy>;

  counterattackTargetingPattern: Interceptable<TargetingStrategy>;
  counterattackTargetType: Interceptable<TargetingType>;
  counterattackAOEShape: Interceptable<GenericAOEShape>;

  maxAttacksPerTurn: Interceptable<number>;
  maxMovementsPerTurn: Interceptable<number>;
  maxCounterattacksPerTurn: Interceptable<number>;

  player: Interceptable<Player>;

  damageDealt: Interceptable<number, { target: Unit }>;
  damageReceived: Interceptable<
    number,
    { amount: number; source: AnyCard; damage: Damage }
  >;

  shouldActivateOnTurnStart: Interceptable<boolean>;

  pathfindingStrategy: Interceptable<PathfindingStrategy>;
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
      canAttack: new Interceptable(),
      canCounterAttack: new Interceptable(),
      canBeAttackTarget: new Interceptable(),
      canBeCounterattackTarget: new Interceptable(),
      canBeCardTarget: new Interceptable(),
      canBeDestroyed: new Interceptable(),
      canReceiveModifier: new Interceptable(),
      canCapture: new Interceptable(),

      maxHp: new Interceptable(),
      atk: new Interceptable(),
      cmd: new Interceptable(),
      movementReach: new Interceptable(),
      sprintReach: new Interceptable(),

      attackTargetingPattern: new Interceptable(),
      attackTargetType: new Interceptable(),
      attackAOEShape: new Interceptable(),
      attackCounterattackParticipants: new Interceptable(),

      counterattackTargetingPattern: new Interceptable(),
      counterattackTargetType: new Interceptable(),
      counterattackAOEShape: new Interceptable(),

      maxAttacksPerTurn: new Interceptable(),
      maxMovementsPerTurn: new Interceptable(),
      maxCounterattacksPerTurn: new Interceptable(),

      player: new Interceptable(),

      damageDealt: new Interceptable(),
      damageReceived: new Interceptable<
        number,
        { amount: number; source: AnyCard; damage: Damage }
      >(),

      shouldActivateOnTurnStart: new Interceptable<boolean>(),

      pathfindingStrategy: new Interceptable<PathfindingStrategy>()
    });
    this.movement = new MovementComponent(game, this, {
      position: options.position,
      pathfinding: new PathfinderComponent(game, () => this.pathfindingStrategy)
    });

    this.combat = new CombatComponent(game, this);
  }

  protected async onInterceptorAdded(key: string) {
    if (key === 'maxHp') {
      await this.checkHp({ source: this.card });
    }
  }

  get player() {
    return this.card.player!;
  }

  get pathfindingStrategy() {
    return this.interceptors.pathfindingStrategy.getValue(
      new SolidBodyPathfindingStrategy(this.game, this),
      {}
    );
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

  get shouldActivateOnTurnStart() {
    return this.interceptors.shouldActivateOnTurnStart.getValue(true, {});
  }

  get isAt() {
    return this.movement.isAt.bind(this.movement);
  }

  get inFront(): BoardCell | null {
    return this.game.boardSystem.getCellAt({
      x: this.player.isPlayer1 ? this.x + 1 : this.x - 1,
      y: this.y
    });
  }

  get behind(): BoardCell | null {
    return this.game.boardSystem.getCellAt({
      x: this.player.isPlayer1 ? this.x - 1 : this.x + 1,
      y: this.y
    });
  }

  get above(): BoardCell | null {
    return this.game.boardSystem.getCellAt({
      x: this.x,
      y: this.y - 1
    });
  }

  get below(): BoardCell | null {
    return this.game.boardSystem.getCellAt({
      x: this.x,
      y: this.y + 1
    });
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

  get cmd() {
    return this.interceptors.cmd.getValue(this.card.cmd, {});
  }

  canCapture(shrine: Shrine) {
    return this.interceptors.canCapture.getValue(shrine.canBeCapturedBy(this), {
      shrine
    });
  }

  async captureShrine(shrine: Shrine) {
    await shrine.capture(this);
    this.exhaust();
  }

  get movementReach() {
    return this.interceptors.movementReach.getValue(
      this.game.config.UNIT_MOVEMENT_REACH,
      {}
    );
  }

  get sprintReach() {
    return this.interceptors.sprintReach.getValue(this.game.config.UNIT_SPRINT_REACH, {});
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
      this.movementsMadeThisTurn < this.maxMovementsPerTurn && !this.isExhausted,
      {}
    );
  }

  canMoveTo(point: Point) {
    if (!this.canMove) return false;
    return this.movement.canMoveTo(point, this.sprintReach);
  }

  async move(to: Point) {
    const distance = this.game.boardSystem.getDistance(this.position, to);

    await this.movement.move(to);
    if (
      distance > this.movementReach &&
      this.movementsMadeThisTurn >= this.maxMovementsPerTurn
    ) {
      this.exhaust();
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

    return this.movement.getAllPossibleMoves(max ?? this.sprintReach).filter(point => {
      const cell = this.game.boardSystem.getCellAt(point)!;
      return !cell.isOccupied;
    });
  }

  get canBeDestroyed(): boolean {
    return this.interceptors.canBeDestroyed.getValue(true, {});
  }

  canAttack(unit: Unit): boolean {
    return this.interceptors.canAttack.getValue(
      this.attacksPerformedThisTurn < this.maxAttacksPerTurn && !this.isExhausted,
      { target: unit }
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
    return this._isExhausted;
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

  get attackAOEShape(): GenericAOEShape {
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

  get counterattackAOEShape(): GenericAOEShape {
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
        affectedUnits: this.attackAOEShape
          .getArea([initialTarget])
          .map(point => this.game.unitSystem.getUnitAt(point))
          .filter(isDefined)
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

  get nearbyUnits(): Unit[] {
    return this.game.unitSystem.getNearbyUnits(this.position);
  }

  get nearbyShrines(): Shrine[] {
    return this.game.boardSystem.getNearbyShrines(this.position);
  }

  getReceivedDamage(damage: Damage, source: AnyCard) {
    return this.interceptors.damageReceived.getValue(damage.baseAmount, {
      damage,
      amount: damage.baseAmount,
      source
    });
  }

  getDealtDamage(target: Unit) {
    return this.interceptors.damageDealt.getValue(this.atk, { target });
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.card.maxHp, {});
  }

  get atk() {
    return this.interceptors.atk.getValue(this.card.atk, {});
  }

  async attack(point: Point) {
    await this.combat.attack(point);
    if (this.attacksPerformedThisTurn >= this.maxAttacksPerTurn) {
      this.exhaust();
    }
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

  async heal(source: AnyCard, amount: number) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_HEAL,
      new UnitBeforeHealEvent({ unit: this, amount, source })
    );

    this.addHp(amount);

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_HEAL,
      new UnitAfterHealEvent({ unit: this, amount, source })
    );
  }

  addHp(amount: number) {
    this.damageTaken = Math.max(this.damageTaken - amount, 0);
  }

  async removeHp(amount: number) {
    this.damageTaken = Math.min(this.damageTaken + amount, this.maxHp);

    await this.checkHp({ source: this.card });
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
      new UnitBeforeDestroyEvent({ source, unit: this })
    );
    const position = this.position;

    await this.removeFromBoard();
    this.modifiers.list.forEach(async modifier => {
      await this.modifiers.remove(modifier.id);
    });

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_DESTROY,
      new UnitAfterDestroyEvent({ source, destroyedAt: position, unit: this })
    );
  }

  exhaust() {
    this._isExhausted = true;
  }

  wakeUp() {
    this._isExhausted = false;
  }

  activate() {
    this.combat.resetAttackCount();
    this.movement.resetMovementsCount();
    this.wakeUp();
  }

  // Check if the unit can attack a point if it were in a given position
  isWithinDangerZone(point: Point, position: Point) {
    const original = this.position.clone();
    this.movement.position.x = position.x;
    this.movement.position.y = position.y;
    const canAttack = this.attackTargettingPattern.isWithinRange(point);
    this.movement.position = original;
    return canAttack;
  }

  async bounce() {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_BOUNCE,
      new UnitBeforeBounceEvent({
        unit: this
      })
    );

    const canBounce = !this.player.cardManager.isHandFull && !isGeneral(this.card);
    if (canBounce) {
      await this.player.cardManager.addToHand(this.card);
      await this.removeFromBoard();
    } else {
      await this.destroy(this.card);
    }

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_BOUNCE,
      new UnitAfterBounceEvent({
        unit: this,
        didBounce: canBounce
      })
    );
  }

  serialize() {
    // calculate this upfront as this can be an expensive operation if we call it many times
    // moves the unit could make provided it was able to move fully
    const potentialMoves = this.getPossibleMoves(
      this.sprintReach * this.maxMovementsPerTurn,
      true
    ).map(point => this.game.boardSystem.getCellAt(point)!);

    // moves the unit can actually make
    const possibleSprintMoves = this.getPossibleMoves(this.sprintReach).map(
      point => this.game.boardSystem.getCellAt(point)!
    );
    const possibleMoves = this.getPossibleMoves(this.movementReach).map(
      point => this.game.boardSystem.getCellAt(point)!
    );

    return {
      id: this.id,
      entityType: 'unit' as const,
      card: this.card.id,
      position: this.position.serialize(),
      baseAtk: this.card.blueprint.atk,
      atk: this.atk,
      baseCmd: this.card.blueprint.cmd,
      cmd: this.cmd,
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
      sprintZone: possibleSprintMoves.map(point => point.id),
      dangerZone: this.game.boardSystem.cells
        .filter(cell =>
          potentialMoves
            .filter(move => cell.isNearby(move))
            .some(point => this.isWithinDangerZone(cell.position, point))
        )
        .map(cell => cell.id),
      attackableCells: this.game.boardSystem.cells
        .filter(cell => this.canAttackAt(cell.position))
        .map(cell => cell.id),
      modifiers: this.modifiers.list.map(modifier => modifier.id),
      capturableShrines: []
    };
  }
}
