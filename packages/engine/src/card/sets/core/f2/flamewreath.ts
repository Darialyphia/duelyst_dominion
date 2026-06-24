import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import dedent from 'dedent';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { CelerityCardModifier } from '../../../../modifier/modifiers/celerity.modifier';

export const flamewreath: MinionBlueprint = {
  id: 'flamewreath',
  name: 'Flamewreath',
  description: dedent /*html*/ `
  <rt-keyword>Rush</rt-keyword>, <rt-keyword>Celerity</rt-keyword>.
  After this moves or teleport, deal 2 damage to enemies in the same column as this.
  `,
  vfx: {
    spriteId: 'minions/f2_flamewreath',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_f4_blacksolus_attack_swing',
    walk: 'sfx_f3_aymarahealer_impact',
    attack: 'sfx_f3_anubis_attack_impact',
    takeDamage: 'sfx_f3_anubis_hit',
    dealDamage: 'sfx_f4_siren_attack_impact',
    death: 'sfx_f3_anubis_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 4,
  atk: 2,
  maxHp: 3,
  retaliation: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card));
    await card.modifiers.add(new CelerityCardModifier(game, card));

    const dealDamage = async () => {
      const targets = card.unit.unitsOnSameColumn.filter(u => u.isEnemy(card.player));

      for (const target of targets) {
        await target.takeDamage(card, new AbilityDamage(card, 2));
      }
    };

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('flamewreath', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_MOVE,
              filter: event => {
                if (!event) return false;
                return event.data.unit.equals(card.unit);
              },
              handler: dealDamage
            }),
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_TELEPORT,
              filter: event => {
                if (!event) return false;
                return event.data.unit.equals(card.unit);
              },
              handler: dealDamage
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
