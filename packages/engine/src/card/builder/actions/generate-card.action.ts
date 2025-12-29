import { match } from 'ts-pattern';
import { resolveBlueprintFilter } from '../filters/blueprint.filter';
import { resolvePlayerFilter } from '../filters/player.filter';
import { Action } from './action';
import type { DeckCard } from '../../components/card-manager.component';

export class GenerateCardsAction extends Action<'generate_cards'> {
  static label = 'Generate cards';

  static description = 'Generates cards for player and put them in a specified location.';

  protected async executeImpl(): Promise<void> {
    const players = resolvePlayerFilter({
      ...this.ctx,
      filter: this.action.params.player
    });

    const blueprints = resolveBlueprintFilter({
      ...this.ctx,
      filter: this.action.params.blueprint
    });

    for (const player of players) {
      for (const blueprint of blueprints) {
        const card = (await player.generateCard(
          blueprint.id,
          this.ctx.card.isFoil
        )) as DeckCard;
        await match(this.action.params.location)
          .with('hand', async () => {
            await player.cardManager.addToHand(card);
          })
          .with('top_of_deck', async () => {
            player.cardManager.deck.addToTop(card);
          })
          .with('bottom_of_deck', async () => {
            player.cardManager.deck.addToBottom(card);
          })
          .with('random_position_in_deck', async () => {
            player.cardManager.deck.addAtRandomPosition(card);
          })
          .with('discard_pile', async () => {
            await card.sendToDiscardPile();
          })
          .exhaustive();
      }
    }
  }
}
