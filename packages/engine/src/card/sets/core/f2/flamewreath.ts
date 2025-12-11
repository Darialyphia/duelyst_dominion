import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { isSpell } from '../../../card-utils';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { AbilityDamage } from '../../../../utils/damage';

export const flamewreath: MinionBlueprint = {
  id: 'flamewreath',
  name: 'Flamewreath',
  description: 'After this moves or teleport, deal 1 damage t onearby enemies.',
  vfx: {
    spriteId: 'minions/f2_flamewreath',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_f4_blacksolus_attack_swing.m4a',
    walk: 'sfx_f3_aymarahealer_impact.m4a',
    attack: 'sfx_f3_anubis_attack_impact.m4a',
    takeDamage: 'sfx_f3_anubis_hit.m4a',
    dealDamage: 'sfx_f4_siren_attack_impact.m4a',
    death: 'sfx_f3_anubis_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.RARE,
  tags: [],
  manaCost: 4,
  runeCost: {},
  atk: 2,
  maxHp: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    const dealDamage = async () => {
      const targets = card.unit.nearbyUnits.filter(u => u.isEnemy(card.unit));

      for (const target of targets) {
        await target.takeDamage(card, new AbilityDamage(card, 1));
      }
    };
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('rythmweaver', game, card, {
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
