import type { BuilderContext } from '../schema';
import type { Action, ActionData } from './action';
import { ActivateUnitAction } from './activate-unit.action';
import { AddModifierToCardsAction } from './add-modifier-to-cards.action';
import { AddModifierToUnitsAction } from './add-modifier-to-units.action';
import { BounceUnitsAction } from './bounce-units.action';
import { DealDamageAction } from './deal-damage.action';
import { DestroyUnitsAction } from './destroy-units.action';
import { DrawCardsFromDeckAction } from './draw-cards-from-deck.action';
import { DrawCardsFromPoolAction } from './draw-cards-from-pool.action';
import { GenerateCardsAction } from './generate-card.action';
import { HealAction } from './heal.action';
import { SelectCardsFromPoolAction } from './select-card-from-pool.action';
import { SelectSpacesOnBoardAction } from './select-spaces-on-board.action';
import { SwapUnitPositionsAction } from './swap-unit-positions.action';
import { TeleportUnitAction } from './teleport-unit.action';

type ActionStatic = {
  label: string;
  description: string;
};

export const ACTION_LOOKUP = {
  deal_damage: DealDamageAction,
  heal: HealAction,
  draw_cards_from_pool: DrawCardsFromPoolAction,
  draw_cards_from_deck: DrawCardsFromDeckAction,
  add_modifier_to_units: AddModifierToUnitsAction,
  add_modifier_to_cards: AddModifierToCardsAction,
  activate_unit: ActivateUnitAction,
  destroy_units: DestroyUnitsAction,
  bounce_units: BounceUnitsAction,
  generate_cards: GenerateCardsAction,
  teleport_unit: TeleportUnitAction,
  swap_unit_positions: SwapUnitPositionsAction,
  select_spaces_on_board: SelectSpacesOnBoardAction,
  select_cards_from_pool: SelectCardsFromPoolAction
} as const satisfies Record<string, ActionStatic>;
