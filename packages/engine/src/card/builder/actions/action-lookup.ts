import { DealDamageAction } from './deal-damage.action';
import { DrawCardsFromDeckAction } from './draw-cards-from-deck.action';
import { DrawCardsFromPoolAction } from './draw-cards-from-pool.action';
import { HealAction } from './heal.action';

export const ACTION_LOOKUP = {
  deal_damage: DealDamageAction,
  heal: HealAction,
  draw_cards_from_pool: DrawCardsFromPoolAction,
  draw_cards_from_deck: DrawCardsFromDeckAction
};
