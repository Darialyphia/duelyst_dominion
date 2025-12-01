import { Vec2, type Point, type Serializable } from '@game/shared';
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
import type { TargetingStrategy, TargetingType } from '../targeting/targeting-strategy';
import type { GenericAOEShape } from '../aoe/aoe-shape';
import { Player } from '../player/player.entity';
import type { Damage } from '../utils/damage';
import type { CounterAttackParticipantStrategy } from './counterattack-participants';
import { CombatComponent } from './components/combat.component';
import { UNIT_EVENTS } from './unit.enums';
import {
  UnitAfterBounceEvent,
  UnitAfterCombatEvent,
  UnitAfterMoveEvent,
  UnitBeforeBounceEvent,
  UnitBeforeMoveEvent
} from './unit-events';
import type { PathfindingStrategy } from '../pathfinding/strategies/pathinding-strategy';
import type { BoardCell } from '../board/entities/board-cell.entity';
import { isGeneral } from '../card/card-utils';
import { UnitSerializer } from './unit.serializer';
import { PositionSensorComponent } from './components/position-sensor.component';
import { HealthComponent } from './components/health.component';
import { StateComponent } from './components/state.component';
import { StatsComponent } from './components/stats.component';
import { TargetingComponent } from './components/targeting.component';

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
  speed: number;
  basespeed: number;
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

  maxHp: Interceptable<number>;
  atk: Interceptable<number>;
  speed: Interceptable<number>;
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

  health: HealthComponent;

  state: StateComponent;

  stats: StatsComponent;

  targeting: TargetingComponent;

  serializer: UnitSerializer;

  positionSensor: PositionSensorComponent;

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

      maxHp: new Interceptable(),
      atk: new Interceptable(),
      speed: new Interceptable(),
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
    this.serializer = new UnitSerializer(game);
    this.movement = new MovementComponent(game, this, {
      position: options.position,
      pathfinding: new PathfinderComponent(game, () => this.pathfindingStrategy)
    });
    this.combat = new CombatComponent(game, this);
    this.state = new StateComponent(this.combat, this.movement);
    this.stats = new StatsComponent(game, this);
    this.targeting = new TargetingComponent(game, this);
    this.positionSensor = new PositionSensorComponent(game, this);
    this.health = new HealthComponent(game, this, () =>
      this.interceptors.maxHp.getValue(this.card.maxHp, {})
    );
  }

  protected async onInterceptorAdded(key: string) {
    if (key === 'maxHp') {
      await this.health.checkHp({ source: this.card });
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
    return this.positionSensor.inFront;
  }

  get behind(): BoardCell | null {
    return this.positionSensor.behind;
  }

  get above(): BoardCell | null {
    return this.positionSensor.above;
  }

  get below(): BoardCell | null {
    return this.positionSensor.below;
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

  get speed() {
    return this.stats.speed;
  }

  get movementReach() {
    return this.stats.movementReach;
  }

  get sprintReach() {
    return this.stats.sprintReach;
  }

  get maxMovementsPerTurn() {
    return this.stats.maxMovementsPerTurn;
  }

  get maxAttacksPerTurn() {
    return this.stats.maxAttacksPerTurn;
  }

  get maxCounterattacksPerTurn() {
    return this.stats.maxCounterattacksPerTurn;
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

  get canMoveTo() {
    return this.movement.canMoveTo.bind(this.movement);
  }

  get move() {
    return this.movement.move.bind(this.movement);
  }

  get teleport() {
    return this.movement.teleport.bind(this.movement);
  }

  get getPathTo() {
    return this.movement.getPathTo.bind(this.movement);
  }

  get getPossibleMoves() {
    return this.movement.getPossibleMoves.bind(this.movement);
  }

  get canBeDestroyed(): boolean {
    return this.interceptors.canBeDestroyed.getValue(true, {});
  }

  get canAttack() {
    return this.targeting.canAttack.bind(this.targeting);
  }

  get canAttackAt() {
    return this.targeting.canAttackAt.bind(this.targeting);
  }

  get isExhausted() {
    return this.state.isExhausted;
  }

  get canBeAttackedBy() {
    return this.targeting.canBeAttackedBy.bind(this.targeting);
  }

  get canBeCounterattackedBy() {
    return this.targeting.canBeCounterattackedBy.bind(this.targeting);
  }

  get canBeTargetedBy() {
    return this.targeting.canBeTargetedBy.bind(this.targeting);
  }

  get attackTargettingPattern() {
    return this.targeting.attackTargettingPattern;
  }

  get attackTargetType() {
    return this.targeting.attackTargetType;
  }

  get attackAOEShape() {
    return this.targeting.attackAOEShape;
  }

  get counterattackTargetingPattern() {
    return this.targeting.counterattackTargetingPattern;
  }

  get counterattackTargetType() {
    return this.targeting.counterattackTargetType;
  }

  get counterattackAOEShape() {
    return this.targeting.counterattackAOEShape;
  }

  get getCounterattackParticipants() {
    return this.targeting.getCounterattackParticipants.bind(this.targeting);
  }

  get canCounterAttack() {
    return this.targeting.canCounterAttack.bind(this.targeting);
  }

  canCounterAttackAt(point: Point) {
    return this.targeting.canCounterAttackAt(point);
  }

  get remainingHp() {
    return this.health.remainingHp;
  }

  get isAlive() {
    return this.health.isAlive;
  }

  get nearbyUnits(): Unit[] {
    return this.positionSensor.nearbyUnits;
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
    return this.health.maxHp;
  }

  get atk() {
    return this.stats.atk;
  }

  async attack(point: Point) {
    await this.combat.attack(point);
    if (this.attacksPerformedThisTurn >= this.maxAttacksPerTurn) {
      this.exhaust();
    }
    await this.game.emit(UNIT_EVENTS.UNIT_AFTER_COMBAT, new UnitAfterCombatEvent({}));
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

  get heal() {
    return this.health.heal.bind(this.health);
  }

  get addHp() {
    return this.health.addHp.bind(this.health);
  }

  get removeHp() {
    return this.health.removeHp.bind(this.health);
  }

  get removeFromBoard() {
    return this.health.removeFromBoard.bind(this.health);
  }

  get destroy() {
    return this.health.destroy.bind(this.health);
  }

  exhaust() {
    this.state.exhaust();
  }

  wakeUp() {
    this.state.wakeUp();
  }

  activate() {
    this.state.activate();
  }

  // Check if the unit can attack a point if it were in a given position
  isWithinDangerZone(point: Point, position: Point) {
    return this.targeting.isWithinDangerZone(point, position);
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
    return this.serializer.serialize(this);
  }
}
