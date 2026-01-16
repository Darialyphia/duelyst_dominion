import { isDefined, type Point, type Serializable } from '@game/shared';
import type { GeneralCard } from '../card/entities/general-card.entity';
import type { MinionCard } from '../card/entities/minion-card.entity';
import type { Game } from '../game/game';
import { EntityWithModifiers } from '../utils/entity-with-modifiers';
import { MovementComponent } from './components/movement.component';
import { Interceptable } from '../utils/interceptable';
import type { AnyCard } from '../card/entities/card.entity';
import type { Modifier } from '../modifier/modifier.entity';
import { CARD_KINDS } from '../card/card.enums';
import { TARGETING_TYPE, type TargetingType } from '../targeting/targeting-strategy';
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
  UnitAfterCombatEvent,
  UnitAfterDestroyEvent,
  UnitAfterHealEvent,
  UnitAfterMoveEvent,
  UnitBeforeBounceEvent,
  UnitBeforeDestroyEvent,
  UnitBeforeHealEvent,
  UnitBeforeMoveEvent
} from './unit-events';
import type { BoardCell } from '../board/entities/board-cell.entity';
import { isGeneral } from '../card/card-utils';
import { GAME_PHASES } from '../game/game.enums';

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
  baseRetaliation: number;
  retaliation: number;
  baseMaxHp: number;
  maxHp: number;
  currentHp: number;
  isFullHp: boolean;
  player: string;
  keywords: Array<{ id: string; name: string; description: string }>;
  isExhausted: boolean;
  isDead: boolean;
  modifiers: string[];
  canMove: boolean;
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
  retaliation: Interceptable<number>;

  attackTarget: Interceptable<Unit | null>;
  attackTargetType: Interceptable<TargetingType>;
  attackAOEShape: Interceptable<GenericAOEShape>;
  attackCounterattackParticipants: Interceptable<CounterAttackParticipantStrategy>;

  counterattackTargetType: Interceptable<TargetingType>;
  counterattackAOEShape: Interceptable<GenericAOEShape>;

  maxAttacksPerTurn: Interceptable<number>;
  maxMovementsPerTurn: Interceptable<number>;
  maxCounterattacksPerTurn: Interceptable<number>;

  player: Interceptable<Player>;

  damageDealt: Interceptable<number, { target: Unit | Player }>;
  damageReceived: Interceptable<
    number,
    { amount: number; source: AnyCard; damage: Damage }
  >;

  shouldActivateOnTurnStart: Interceptable<boolean>;
  shouldExhaustAfterMoving: Interceptable<boolean>;
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

      maxHp: new Interceptable(),
      atk: new Interceptable(),
      retaliation: new Interceptable(),

      attackTarget: new Interceptable(),
      attackTargetType: new Interceptable(),
      attackAOEShape: new Interceptable(),
      attackCounterattackParticipants: new Interceptable(),

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

      shouldActivateOnTurnStart: new Interceptable(),
      shouldExhaustAfterMoving: new Interceptable()
    });
    this.movement = new MovementComponent(game, this, {
      position: options.position
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

  get isAloneOnRow() {
    const unitsOnRow = this.game.unitSystem.units.filter(
      unit => unit.position.y === this.y && !unit.equals(this) && unit.isAlly(this)
    );
    return unitsOnRow.length === 0;
  }

  get isAttacking() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.COMBAT) return false;
    return phaseCtx.ctx.currentAttacker?.equals(this) ?? false;
  }

  get isAttackTarget() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.COMBAT) return false;
    return phaseCtx.ctx.currentTarget?.equals(this) ?? false;
  }

  get attackTarget(): Unit | Player | null {
    const enemiesOnRow = this.game.boardSystem
      .getRow(this.y)
      .filter(cell => cell.player?.equals(this.player.opponent))
      .map(cell => cell.unit)
      .filter(isDefined);

    if (enemiesOnRow.length === 0) {
      return this.player.opponent;
    }

    const [base] = enemiesOnRow.sort((a, b) => {
      const distA = Math.abs(a.x - this.x);
      const distB = Math.abs(b.x - this.x);
      return distA - distB;
    });

    return this.interceptors.attackTarget.getValue(base ?? null, {});
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
    return this.movement.canMoveTo(point);
  }

  get shouldExhaustAfterMoving() {
    return this.interceptors.shouldExhaustAfterMoving.getValue(true, {});
  }

  async move(to: Point) {
    await this.movement.move(to);
    if (this.shouldExhaustAfterMoving) {
      this.exhaust();
    }
  }

  async teleport(to: Point, silent = false) {
    // dont trigger events if moving from a source outside of the game (for example sandbox tools)
    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_BEFORE_TELEPORT,
        new UnitBeforeMoveEvent({
          unit: this,
          position: this.position
        })
      );
    }
    const prevPosition = this.movement.position.clone();
    this.movement.position.x = to.x;
    this.movement.position.y = to.y;
    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_AFTER_TELEPORT,
        new UnitAfterMoveEvent({
          unit: this,
          position: this.position,
          previousPosition: prevPosition
        })
      );
    }
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

  get attackTargetType(): TargetingType {
    return this.interceptors.attackTargetType.getValue(TARGETING_TYPE.ENEMY_UNIT, {});
  }

  get attackAOEShape(): GenericAOEShape {
    return this.interceptors.attackAOEShape.getValue(this.card.attackAOEShape, {});
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

  get remainingHp() {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  get isAlive() {
    return this.remainingHp > 0;
  }

  get nearbyUnits(): Unit[] {
    return this.game.unitSystem.getNearbyUnits(this.position);
  }

  getReceivedDamage(damage: Damage, source: AnyCard) {
    return this.interceptors.damageReceived.getValue(damage.baseAmount, {
      damage,
      amount: damage.baseAmount,
      source
    });
  }

  getAttackDamage(target: Unit) {
    return this.interceptors.damageDealt.getValue(this.atk, { target });
  }

  getRetaliationDamage(attacker: Unit) {
    return this.interceptors.damageDealt.getValue(this.retaliation, { target: attacker });
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.card.maxHp, {});
  }

  get atk() {
    return this.interceptors.atk.getValue(this.card.atk, {});
  }

  get retaliation() {
    return this.interceptors.retaliation.getValue(this.card.retaliation, {});
  }

  async attack(point: Unit | Player) {
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
    this.game.unitSystem.removeUnit(this);
  }

  async destroy(source: AnyCard, silent = false) {
    // we force the destruction if it is silent since this comes from sandbox tools
    if (!this.canBeDestroyed && !silent) return;

    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_BEFORE_DESTROY,
        new UnitBeforeDestroyEvent({ source, unit: this })
      );
    }
    const position = this.position;

    await this.removeFromBoard();
    await this.card.sendToDiscardPile();

    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_AFTER_DESTROY,
        new UnitAfterDestroyEvent({ source, destroyedAt: position, unit: this })
      );
    }
    // remove modifiers after the events to avoid removing OnDestroy modifiers
    for (const modifier of this.modifiers.list) {
      await this.modifiers.remove(modifier.id);
    }
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

  async bounce(silent = false) {
    if (!silent) {
      await this.game.emit(
        UNIT_EVENTS.UNIT_BEFORE_BOUNCE,
        new UnitBeforeBounceEvent({
          unit: this
        })
      );
    }

    const canBounce = !this.player.cardManager.isHandFull && !isGeneral(this.card);
    // we force the bounce if it is silent since this comes from sandbox tools
    if (canBounce || silent) {
      await this.player.cardManager.addToHand(this.card as MinionCard);
      await this.removeFromBoard();
      for (const modifier of this.modifiers.list) {
        await this.modifiers.remove(modifier.id);
      }
      if (!silent) {
        await this.game.emit(
          UNIT_EVENTS.UNIT_AFTER_BOUNCE,
          new UnitAfterBounceEvent({
            unit: this,
            didBounce: canBounce
          })
        );
      }
    } else {
      await this.destroy(this.card, silent);
    }
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'unit' as const,
      card: this.card.id,
      position: this.position.serialize(),
      baseAtk: this.card.blueprint.atk,
      atk: this.atk,
      baseRetaliation: this.card.blueprint.retaliation,
      retaliation: this.retaliation,
      baseMaxHp: this.card.blueprint.maxHp,
      maxHp: this.maxHp,
      currentHp: this.remainingHp,
      isFullHp: this.remainingHp === this.maxHp,
      isGeneral: this.isGeneral,
      player: this.player.id,
      keywords: [],
      isExhausted: this.isExhausted,
      isDead: !this.isAlive,
      modifiers: this.modifiers.list.map(modifier => modifier.id),
      canMove: this.canMove
    };
  }
}
