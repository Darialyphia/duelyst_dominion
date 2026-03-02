import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { GeneralBlueprint } from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { Ability, type SerializedAbility } from './ability.entity';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../targeting/targeting-strategy';
import {
  GENERAL_EVENTS,
  GeneralAfterSummonedEvent,
  GeneralBeforeSummonedEvent,
  GeneralUseAbilityEvent
} from '../events/general.events';
import type { MaybePromise } from '@game/shared';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import { SummoningSicknessModifier } from '../../modifier/modifiers/summoning-sickness.modifier';
import { CARD_EVENTS, CARD_LOCATIONS } from '../card.enums';
import { CardBeforePlayEvent, CardAfterPlayEvent } from '../card.events';
import { GAME_EVENTS } from '../../game/game.events';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.straegy';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedGeneralCard = SerializedCard & {
  atk: number;
  maxHp: number;
  manaCost: number;
  retaliation: number;
  abilities: SerializedAbility[];
  unplayableReason: string | null;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type GeneralCardInterceptors = CardInterceptors & {
  atk: Interceptable<number>;
  maxHp: Interceptable<number>;
  retaliation: Interceptable<number>;
  canUseAbility: Interceptable<boolean, GeneralCard>;
  canPlay: Interceptable<boolean>;
};

export class GeneralCard extends Card<
  SerializedGeneralCard,
  GeneralCardInterceptors,
  GeneralBlueprint
> {
  abilities: Ability<GeneralCard>[] = [];

  deployCooldown: number;

  constructor(game: Game, player: Player, options: CardOptions<GeneralBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        retaliation: new Interceptable(),
        canUseAbility: new Interceptable(),
        canPlay: new Interceptable()
      },
      options
    );
    this.abilities = this.blueprint.abilities.map(
      ability => new Ability<GeneralCard>(game, this, ability)
    );
    this.deployCooldown = this.game.config.GENERAL_INITIAL_DEPLOY_COOLDOWN;
    this.game.on(GAME_EVENTS.TURN_START, async () => {
      this.deployCooldown = Math.max(0, this.deployCooldown - 1);
    });
  }

  get canReplace() {
    return false;
  }

  get hasAvailablePosition() {
    return this.game.boardSystem.cells.some(
      cell => cell.player?.equals(this.player) && !cell.isOccupied
    );
  }

  get canAfford() {
    return this.player.canSpendMana(this.manaCost);
  }

  get unplayableReason() {
    if (!this.hasAvailablePosition) {
      return 'No available position to play this card.';
    }
    if (!this.canAfford) {
      return "You don't have enough mana.";
    }
    if (this.deployCooldown > 0) {
      return `On cooldown for ${this.deployCooldown} more turn${this.deployCooldown === 1 ? '' : 's'}.`;
    }
    return this.canPlay() ? null : 'You cannot play this card.';
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.canAfford && this.hasAvailablePosition && this.deployCooldown === 0,
      {}
    );
  }

  async selectPosition() {
    return new Promise<
      { position: BoardCell; cancelled: false } | { cancelled: true; position?: never }
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
            return !!(cell.player?.equals(this.player) && !cell.isOccupied);
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
        resolve({ position, cancelled: false });
      }
    );
  }

  async selectTargets() {
    return await this.blueprint.getTargets(this.game, this);
  }

  private async selectPositionAndTargets() {
    return new Promise<
      | { position: BoardCell; targets: BoardCell[]; cancelled: false }
      | { cancelled: true; position?: never; targets?: never }
    >(
      // eslint-disable-next-line no-async-promise-executor
      async resolve => {
        const { position, cancelled } = await this.selectPosition();
        if (cancelled) return;

        const targets = await this.selectTargets();
        if (cancelled) return;

        resolve({ position, targets, cancelled: false });
      }
    );
  }

  getAOE(position: BoardCell, targets: BoardCell[]) {
    return this.blueprint.getAoe(this.game, this, position, targets);
  }

  private addUnitListeners() {
    const cleanups = [
      this.game.on(GAME_EVENTS.UNIT_AFTER_DESTROY, async event => {
        if (!event.data.unit.card.equals(this)) return;

        this.deployCooldown = this.game.config.GENERAL_DEPLOY_COOLDOWN;
        await this.addToHand();
        cleanups.forEach(cleanup => cleanup());
      }),

      this.game.on(GAME_EVENTS.TURN_END, async () => {
        if (this.location === CARD_LOCATIONS.DISCARD_PILE) {
          await this.addToHand();
        }
      }),

      this.game.on(GAME_EVENTS.UNIT_AFTER_ATTACK, async event => {
        if (!event.data.unit.card.equals(this)) return;

        await this.player.levelManager.gainExp(
          this.game.config.EXP_GAIN_PER_GENERAL_ATTACK
        );
      })
    ];
  }

  async playAt(position: BoardCell, targets: BoardCell[]) {
    await this.removeFromCurrentLocation();
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    const aoe = this.getAOE(position, targets);
    await this.game.emit(
      GENERAL_EVENTS.GENERAL_BEFORE_SUMMON,
      new GeneralBeforeSummonedEvent({
        card: this,
        cell: position,
        targets,
        aoe
      })
    );
    this.game.unitSystem.addUnit(this, position);

    await this.unit!.modifiers.add(new SummoningSicknessModifier(this.game, this));
    this.unit!.exhaust();
    this.addUnitListeners();

    await this.game.emit(
      GENERAL_EVENTS.GENERAL_AFTER_SUMMON,
      new GeneralAfterSummonedEvent({
        card: this,
        unit: this.unit!,
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

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );

    this.spacesToHighlight = [];
  }

  async play(onCancel?: () => MaybePromise<void>) {
    const { position, targets, cancelled } = await this.selectPositionAndTargets();
    if (cancelled) return await onCancel?.();

    await this.playAt(position, targets);
  }

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.id === id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(ability.canUse, this);
  }

  async useAbility(id: string) {
    const ability = this.abilities.find(ability => ability.id === id);
    if (!ability) return;

    await this.game.emit(
      GENERAL_EVENTS.GENERAL_BEFORE_USE_ABILITY,
      new GeneralUseAbilityEvent({ card: this, abilityId: id })
    );

    await ability.use();

    await this.game.emit(
      GENERAL_EVENTS.GENERAL_AFTER_USE_ABILITY,
      new GeneralUseAbilityEvent({ card: this, abilityId: id })
    );
  }
  serialize() {
    return {
      ...this.serializeBase(),
      atk: this.atk,
      retaliation: this.retaliation,
      maxHp: this.maxHp,
      manaCost: this.blueprint.manaCost,
      abilities: this.abilities.map(ability => ability.serialize()),
      unplayableReason: this.unplayableReason
    };
  }

  removeFromBoard(): Promise<void> {
    return Promise.resolve();
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, {});
  }

  get atk() {
    return this.interceptors.atk.getValue(this.blueprint.atk, {});
  }

  get retaliation() {
    return this.interceptors.retaliation.getValue(this.blueprint.retaliation, {});
  }

  get unit() {
    return this.player.deployedGeneral;
  }

  get attackPattern() {
    return new MeleeTargetingStrategy(this.game, this.unit!, this.unit!.attackTargetType);
  }

  get attackAOEShape() {
    return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {});
  }

  get counterattackPattern() {
    return new MeleeTargetingStrategy(
      this.game,
      this.unit!,
      this.unit!.counterattackTargetType
    );
  }

  get counterattackAOEShape() {
    return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {});
  }
}
