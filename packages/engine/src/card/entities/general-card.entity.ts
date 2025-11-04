import type { Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.straegy';
import { Interceptable } from '../../utils/interceptable';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
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

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedGeneralCard = SerializedCard & {
  atk: number;
  maxHp: number;
  abilities: SerializedAbility[];
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type GeneralCardInterceptors = CardInterceptors & {
  atk: Interceptable<number>;
  maxHp: Interceptable<number>;
  canUseAbility: Interceptable<boolean, GeneralCard>;
};

export const GENERAL_EVENTS = {
  GENERAL_BEFORE_USE_ABILITY: 'general:before-use-ability',
  GENERAL_AFTER_USE_ABILITY: 'general:after-use-ability'
} as const;
export type GeneralEvent = Values<typeof GENERAL_EVENTS>;

export class GeneralUseAbilityEvent extends TypedSerializableEvent<
  { card: GeneralCard; abilityId: string },
  { card: string; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.id,
      abilityId: this.data.abilityId
    };
  }
}

export type GeneralEventMap = {
  [GENERAL_EVENTS.GENERAL_BEFORE_USE_ABILITY]: GeneralUseAbilityEvent;
  [GENERAL_EVENTS.GENERAL_AFTER_USE_ABILITY]: GeneralUseAbilityEvent;
};

export class GeneralCard extends Card<
  SerializedGeneralCard,
  GeneralCardInterceptors,
  GeneralBlueprint
> {
  abilities: Ability<GeneralCard>[] = [];

  constructor(game: Game, player: Player, options: CardOptions<GeneralBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        canUseAbility: new Interceptable()
      },
      options
    );
    this.abilities = this.blueprint.abilities.map(
      ability => new Ability<GeneralCard>(game, this, ability)
    );
  }

  canPlay(): boolean {
    return true;
  }

  async play() {
    await this.game.unitSystem.addUnit(
      this,
      this.player.isPlayer1
        ? this.game.boardSystem.map.generalPositions[0]
        : this.game.boardSystem.map.generalPositions[1]
    );

    await this.blueprint.onPlay(this.game, this);
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
      maxHp: this.maxHp,
      abilities: this.abilities.map(ability => ability.serialize())
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

  get unit() {
    return this.player.general;
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
    return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT);
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
    return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT);
  }
}
