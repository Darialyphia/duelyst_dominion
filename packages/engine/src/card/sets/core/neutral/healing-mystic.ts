import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { defineAction } from '../../../builder/actions/action';
import type { CardFilter } from '../../../builder/filters/card.filters';
import {
  defineCardblueprintSchema,
  type MinionBlueprintSchema
} from '../../../builder/schema';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const healingMystic: MinionBlueprint = {
  id: 'healing-mystic',
  name: 'Healing Mystic',
  description: '@On Enter@: Heal a minion for 2.',
  sprite: { id: 'minions/neutral_healing-mystic' },
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
  cmd: 1,
  maxHp: 3,
  getTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, { required: false });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
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

// const healingMysticData = defineCardblueprintSchema({
//   id: 'healing-mystic',
//   name: 'Healing Mystic',
//   description: '@On Enter@: Heal a minion for 2.',
//   sprite: { id: 'minions/neutral_healing-mystic' },
//   kind: CARD_KINDS.MINION,
//   collectable: true,
//   setId: CARD_SETS.CORE,
//   faction: FACTIONS.NEUTRAL,
//   rarity: RARITIES.BASIC,
//   tags: [],
//   manaCost: 2,
//   runeCost: {
//     yellow: 1
//   },
//   atk: 2,
//   cmd: 1,
//   maxHp: 3,
//   canPlay: {
//     groups: [],
//     type: 'all'
//   },
//   getAoe: {
//     type: 'point',
//     targetingType: TARGETING_TYPE.ALLY_MINION,
//     params: {}
//   },
//   getTargets: {
//     min: 0,
//     targets: [
//       {
//         type: 'all',
//         groups: [
//           [
//             {
//               type: 'has_unit',
//               params: {
//                 unit: {
//                   type: 'all',
//                   groups: [[{ type: 'any_unit' }]]
//                 }
//               }
//             }
//           ]
//         ]
//       }
//     ]
//   },
//   onInit: [
//     defineAction({
//       type: 'add_modifier_to_cards',
//       params: {
//         targets: {
//           type: 'all',
//           groups: [[{ type: 'card_self', params: { not: false } }]]
//         },

//       }
//     })
//   ],
//   onPlay: []
// });
