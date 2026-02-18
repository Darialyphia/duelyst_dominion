import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { GAME_EVENTS } from '../../../../game/game.events';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const primusFist: MinionBlueprint = {
  id: 'primus-fist',
  name: 'Primus Fist',
  description: '@On Enter@: Give adjacent allies +1 Attack.',
  vfx: {
    spriteId: 'minions/neutral_primus-fist',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy_2',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f5_vindicator_attack_impact',
    takeDamage: 'sfx_neutral_grimrock_hit',
    dealDamage: 'sfx_neutral_grimrock_attack_impact',
    death: 'sfx_neutral_grimrock_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [],
  runeCost: {},
  manaCost: 2,
  atk: 2,
  maxHp: 3,
  retaliation: 1,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        const adjacentAllies = card.unit.adjacentUnits.filter(u => u.isAlly(card.player));
        for (const ally of adjacentAllies) {
          await ally.modifiers.add(
            new UnitSimpleAttackBuffModifier('primus-fist-buff', game, card, {
              amount: 1
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
