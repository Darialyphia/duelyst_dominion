import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import dedent from 'dedent';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { songhaiSpawn } from '../../../card-vfx-sequences';

export const tuskBoar: MinionBlueprint = {
  id: 'tusk_boar',
  name: 'Tusk Boar',
  description: dedent`@Rush@.
  At the start of your turn, return this to your hand.`,
  vfx: {
    spriteId: 'minions/f2_tusk-boar',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_summonlegendary',
    walk: 'sfx_neutral_arakiheadhunter_hit',
    attack: 'sfx_f6_seismicelemental_attack_impact',
    takeDamage: 'sfx_neutral_golembloodshard_hit',
    dealDamage: 'sfx_f2_lanternfox_death',
    death: 'sfx_f2_lanternfox_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  runeCost: {},
  manaCost: 2,
  atk: 2,
  maxHp: 3,
  retaliation: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card));

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('tsusk-boar-bounce', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.TURN_END,
              async handler() {
                await card.unit.bounce();
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
