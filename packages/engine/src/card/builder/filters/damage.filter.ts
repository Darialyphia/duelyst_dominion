import type { BetterExtract } from '@game/shared';
import {
  CombatDamage,
  DAMAGE_TYPES,
  type Damage,
  type DamageType
} from '../../../utils/damage';
import { resolveCardFilter, type CardFilter } from './card.filters';
import type { Filter } from './filter';
import { resolveUnitFilter, type UnitFilter } from './unit.filters';
import type { BuilderContext } from '../schema';
import type { Amount } from '../values/amount';
import { match } from 'ts-pattern';

export type DamageFilter =
  | { type: 'any_damage'; source: Filter<CardFilter> }
  | {
      type: BetterExtract<DamageType, 'COMBAT'>;
      amount: Amount;
      source: Filter<UnitFilter>;
    }
  | {
      type: BetterExtract<DamageType, 'SPELL'>;
      amount: Amount;
      source: Filter<CardFilter>;
    }
  | {
      type: BetterExtract<DamageType, 'ABILITY'>;
      amount: Amount;
      source: Filter<CardFilter>;
    };

type DamageContext = BuilderContext & { filter: Filter<DamageFilter>; damage: Damage };

export const resolveDamageFilter = ({ filter, damage, ...ctx }: DamageContext) => {
  if (!filter.groups.length) return true;

  return filter.groups.some(group => {
    return group.every(condition => {
      return match(condition)
        .with({ type: 'any_damage' }, condition => {
          const cards = resolveCardFilter({
            ...ctx,
            filter: condition.source
          });

          return cards.some(card => card.equals(damage.source));
        })
        .with({ type: DAMAGE_TYPES.COMBAT }, condition => {
          if (!(damage instanceof CombatDamage)) {
            return false;
          }

          const units = resolveUnitFilter({
            ...ctx,
            filter: condition.source
          });

          return units.some(unit => unit.equals(damage.attacker));
        })
        .with({ type: DAMAGE_TYPES.SPELL }, condition => {
          if (damage.type !== DAMAGE_TYPES.SPELL) {
            return false;
          }

          const cards = resolveCardFilter({
            ...ctx,
            filter: condition.source
          });

          return cards.some(card => card.equals(damage.source));
        })
        .with({ type: DAMAGE_TYPES.ABILITY }, condition => {
          if (damage.type !== DAMAGE_TYPES.ABILITY) {
            return false;
          }

          const cards = resolveCardFilter({
            ...ctx,
            filter: condition.source
          });

          return cards.some(card => card.equals(damage.source));
        })
        .exhaustive();
    });
  });
};
