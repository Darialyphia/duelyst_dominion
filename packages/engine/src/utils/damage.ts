import type { Values } from '@game/shared';
import type { Unit } from '../unit/unit.entity';
import type { AnyCard } from '../card/entities/card.entity';
import type { SpellCard } from '../card/entities/spell-card.entity';

export const DAMAGE_TYPES = {
  COMBAT: 'COMBAT',
  ABILITY: 'ABILITY',
  SPELL: 'SPELL'
} as const;

export type DamageType = Values<typeof DAMAGE_TYPES>;

export type DamageOptions = {
  baseAmount: number;
  type: DamageType;
  source: AnyCard;
};

export abstract class Damage {
  protected _baseAmount: number;

  readonly type: DamageType;

  protected source: AnyCard;

  constructor(options: DamageOptions) {
    this._baseAmount = options.baseAmount;
    this.type = options.type;
    this.source = options.source;
  }

  get baseAmount() {
    return this._baseAmount;
  }

  getFinalAmount(target: Unit): number {
    return target.getReceivedDamage(this, this.source);
  }
}

export class CombatDamage extends Damage {
  private _attacker: Unit;

  constructor(attacker: Unit) {
    super({ baseAmount: attacker.atk, type: DAMAGE_TYPES.COMBAT, source: attacker.card });
    this._attacker = attacker;
  }

  get attacker() {
    return this._attacker;
  }
}

export class SpellDamage extends Damage {
  constructor(source: SpellCard, amount: number) {
    super({ baseAmount: amount, type: DAMAGE_TYPES.SPELL, source });
  }
}

export class AbilityDamage extends Damage {
  constructor(source: AnyCard, amount: number) {
    super({ baseAmount: amount, type: DAMAGE_TYPES.ABILITY, source });
  }
}
