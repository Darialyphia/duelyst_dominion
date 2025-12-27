import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleUnitTargetRules } from '../../../card-utils';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const healingMystic: MinionBlueprint = {
  id: 'healing-mystic',
  name: 'Healing Mystic',
  description: '@On Enter@: Heal a minion for 2.',
  vfx: {
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    },
    spriteId: 'minions/neutral_healing-mystic'
  },
  sounds: {
    play: 'sfx_unit_deploy_3.m4a',
    walk: 'sfx_neutral_ladylocke_attack_impact.m4a',
    attack: 'sfx_f6_voiceofthewind_attack_swing.m4a',
    takeDamage: 'sfx_neutral_spelljammer_hit.m4a',
    dealDamage: 'sfx_neutral_spelljammer_attack_impact.m4a',
    death: 'sfx_neutral_spelljammer_death.m4a'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.BASIC,
  tags: [],
  manaCost: 2,
  runeCost: {
    yellow: 1
  },
  atk: 2,
  maxHp: 3,
  getTargets(game, card) {
    return singleUnitTargetRules.getPreResponseTargets(game, card, {
      required: false,
      getLabel() {
        return `${card.blueprint.name} : Select a minion to heal`;
      }
    });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_UNIT, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async event => {
        const [target] = event.data.targets;
        if (!target) return;
        await target.unit?.heal(card, 2);
      })
    );
  },
  async onPlay() {}
};

// export const healingMystic = parseMinionBlueprintSchema(
//   defineCardblueprintSchema({
//     id: 'healing-mystic',
//     name: 'Healing Mystic',
//     description: '@On Enter@: Heal a minion for 2.',
//     sprite: { id: 'minions/neutral_healing-mystic' },
//     kind: CARD_KINDS.MINION,
//     collectable: true,
//     setId: CARD_SETS.CORE,
//     faction: FACTIONS.NEUTRAL,
//     rarity: RARITIES.BASIC,
//     tags: [],
//     manaCost: 2,
//     runeCost: {
//       yellow: 1
//     },
//     atk: 2,
//     cmd: 1,
//     maxHp: 3,
//     canPlay: {
//       groups: [],
//       type: 'all'
//     },
//     getAoe: {
//       type: 'point',
//       targetingType: TARGETING_TYPE.ALLY_MINION,
//       params: {}
//     },
//     getTargets: {
//       min: 0,
//       targets: [
//         {
//           type: 'all',
//           groups: [
//             [
//               {
//                 type: 'has_unit',
//                 params: {
//                   unit: {
//                     type: 'all',
//                     groups: [[{ type: 'any_unit' }]]
//                   }
//                 }
//               }
//             ]
//           ]
//         }
//       ]
//     },
//     onInit: [
//       {
//         type: 'add_modifier_to_cards',
//         params: {
//           targets: {
//             type: 'all',
//             groups: [[{ type: 'card_self', params: { not: false } }]]
//           },
//           timing: 'now',
//           condition: { type: 'all', groups: [[]] },
//           modifier: {
//             modifierType: KEYWORDS.ON_ENTER.id,
//             mixins: [
//               {
//                 type: 'keyword',
//                 params: { keyword: KEYWORDS.ON_ENTER }
//               },
//               {
//                 type: 'game-event',
//                 params: {
//                   eventName: GAME_EVENTS.MINION_BEFORE_SUMMON,
//                   filter: {
//                     type: 'all',
//                     groups: [
//                       [
//                         {
//                           type: 'card_equals',
//                           params: {
//                             cardA: {
//                               type: 'all',
//                               groups: [
//                                 [{ type: 'modifier_target', params: { not: false } }]
//                               ]
//                             },
//                             cardB: {
//                               type: 'all',
//                               groups: [
//                                 [{ type: 'summoned_minion_card', params: { not: false } }]
//                               ]
//                             }
//                           }
//                         },
//                         {
//                           type: 'card_equals',
//                           params: {
//                             cardA: {
//                               type: 'all',
//                               groups: [
//                                 [
//                                   {
//                                     type: 'current_played_card_from_hand',
//                                     params: { not: false }
//                                   }
//                                 ]
//                               ]
//                             },
//                             cardB: {
//                               type: 'all',
//                               groups: [
//                                 [{ type: 'summoned_minion_card', params: { not: false } }]
//                               ]
//                             }
//                           }
//                         }
//                       ]
//                     ]
//                   },
//                   frequencyPerGameTurn: {
//                     enabled: false
//                   },
//                   frequencyPerPlayerTurn: {
//                     enabled: false
//                   },
//                   actions: [
//                     {
//                       type: 'heal',
//                       params: {
//                         timing: 'now',
//                         amount: { type: 'fixed', params: { value: 2 } },
//                         condition: { type: 'all', groups: [[]] },
//                         targets: {
//                           type: 'all',
//                           groups: [
//                             [
//                               {
//                                 type: 'is_manual_target',
//                                 params: { index: 0, not: false }
//                               }
//                             ]
//                           ]
//                         }
//                       }
//                     }
//                   ]
//                 }
//               }
//             ]
//           }
//         }
//       }
//     ],
//     onPlay: []
//   })
// );
