import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const ghostLynx: MinionBlueprint = {
  id: 'ghost-lynx',
  name: 'Ghost Lynx',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger>: draw a card at the end of the turn.
  `,
  vfx: {
    spriteId: 'minions/neutral_ghost-lynx',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_diretidefrenzy',
    walk: 'sfx_neutral_grimrock_hit',
    attack: 'sfx_neutral_xho_attack_swing',
    takeDamage: 'sfx_neutral_xho_hit',
    dealDamage: 'sfx_neutral_xho_attack_impact',
    death: 'sfx_neutral_xho_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 1,
  atk: 1,
  maxHp: 2,
  retaliation: 1,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, {
        timing: 'after',
        async handler() {
          game.once(GAME_EVENTS.TURN_END, async () => {
            await card.player.cardManager.drawFromDeck(1);
          });
        }
      })
    );
  },
  async onPlay() {}
};
