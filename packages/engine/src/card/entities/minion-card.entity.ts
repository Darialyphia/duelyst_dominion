import type { MinionBlueprint } from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.straegy';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { Interceptable } from '../../utils/interceptable';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { MinionSummonTargetingStrategy } from '../../targeting/minion-summon-targeting.strategy';
import { CARD_EVENTS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import {
  TARGETING_TYPE,
  type TargetingStrategy
} from '../../targeting/targeting-strategy';
import type { MaybePromise } from '@game/shared';
import {
  MINION_EVENTS,
  MinionAfterSummonedEvent,
  MinionBeforeSummonedEvent
} from '../events/minion.events';
import { SummoningSicknessModifier } from '../../modifier/modifiers/summoning-sickness.modifier';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedMinionCard = SerializedCard & {
  atk: number;
  maxHp: number;
  manaCost: number;
  unplayableReason: string | null;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type MinionCardInterceptors = CardInterceptors & {
  atk: Interceptable<number>;
  maxHp: Interceptable<number>;
  summonTargetingStrategy: Interceptable<TargetingStrategy>;
  canPlay: Interceptable<boolean, MinionCard>;
  hasSummoningSickness: Interceptable<boolean, MinionCard>;
};

export class MinionCard extends Card<
  SerializedMinionCard,
  MinionCardInterceptors,
  MinionBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<MinionBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        summonTargetingStrategy: new Interceptable(),
        canPlay: new Interceptable(),
        hasSummoningSickness: new Interceptable()
      },
      options
    );
  }

  get hasAvailablePosition() {
    return this.game.boardSystem.cells.some(cell =>
      this.summoningTargetingStrategy.canTargetAt(cell)
    );
  }

  get canAfford() {
    return this.player.canSpendMana(this.manaCost);
  }

  get hasSummoningSickness(): boolean {
    return this.interceptors.hasSummoningSickness.getValue(true, this);
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.hasAvailablePosition &&
        this.canAfford &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  get unplayableReason() {
    if (!this.hasAvailablePosition) {
      return 'No available position to play this card.';
    }
    if (!this.canAfford) {
      return "You don't have enough mana.";
    }

    return this.canPlay() ? null : 'You cannot play this card.';
  }

  async removeFromBoard() {
    await this.unit.removeFromBoard();
  }

  get summoningTargetingStrategy() {
    return this.interceptors.summonTargetingStrategy.getValue(
      new MinionSummonTargetingStrategy(this.game, this),
      {}
    );
  }

  private async selectPositionAndTargets() {
    return new Promise<
      | { position: BoardCell; targets: BoardCell[]; cancelled: false }
      | { cancelled: true; position?: never; targets?: never }
    >(
      // eslint-disable-next-line no-async-promise-executor
      async resolve => {
        let cancelled = false;
        this.cancelPlay = async () => {
          cancelled = true;
          await this.game.interaction.getContext().ctx.cancel(this.player);
          resolve({ cancelled: true });
        };

        const [position] = await this.game.interaction.selectSpacesOnBoard({
          player: this.player,
          source: this,
          getLabel: () => `Select position to summon ${this.blueprint.name}`,
          isElligible: cell => {
            return this.summoningTargetingStrategy.canTargetAt(cell);
          },
          canCommit(selectedSlots) {
            return selectedSlots.length === 1;
          },
          isDone(selectedSlots) {
            return selectedSlots.length === 1;
          },
          getAoe: () => new PointAOEShape(TARGETING_TYPE.ANYWHERE, {})
        });
        if (cancelled) return;
        this.spacesToHighlight = [position.position.serialize()];
        const targets = await this.blueprint.getTargets(this.game, this);
        if (cancelled) return;

        resolve({ position, targets, cancelled: false });
      }
    );
  }

  getAOE(position: BoardCell, targets: BoardCell[]) {
    return this.blueprint.getAoe(this.game, this, position, targets);
  }

  async play(onCancel?: () => MaybePromise<void>) {
    const { position, targets, cancelled } = await this.selectPositionAndTargets();
    if (cancelled) return await onCancel?.();

    await this.removeFromCurrentLocation();
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    const aoe = this.getAOE(position, targets);
    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_SUMMON,
      new MinionBeforeSummonedEvent({
        card: this,
        cell: position,
        targets,
        aoe
      })
    );
    this.game.unitSystem.addUnit(this, position);

    if (this.hasSummoningSickness) {
      await this.unit.modifiers.add(new SummoningSicknessModifier(this.game, this));
      this.unit.exhaust();
    }

    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_SUMMON,
      new MinionAfterSummonedEvent({
        card: this,
        unit: this.unit,
        targets,
        aoe
      })
    );
    await this.game.vfxSystem.playSequence(
      this.blueprint.vfx.sequences?.play?.(
        this.game,
        this,
        position.position.serialize(),
        targets.map(t => t.position.serialize())
      ) ?? {
        tracks: []
      }
    );
    await this.blueprint.onPlay(this.game, this, {
      aoe,
      position,
      targets
    });

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );

    this.spacesToHighlight = [];
  }

  serialize() {
    return {
      ...this.serializeBase(),
      atk: this.atk,
      maxHp: this.maxHp,
      manaCost: this.manaCost,
      unplayableReason: this.unplayableReason
    };
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, {});
  }

  get atk() {
    return this.interceptors.atk.getValue(this.blueprint.atk, {});
  }

  get unit() {
    return this.game.unitSystem.units.find(unit => unit.card.equals(this))!;
  }

  get attackPattern() {
    return new MeleeTargetingStrategy(
      this.game,
      this.unit,
      this.unit.attackTargetType,
      false
    );
  }

  get attackAOEShape() {
    return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {});
  }

  get counterattackPattern() {
    return new MeleeTargetingStrategy(
      this.game,
      this.unit,
      this.unit.counterattackTargetType,
      false
    );
  }

  get counterattackAOEShape() {
    return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {});
  }
}
