import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const bloodtearAlchemist: MinionBlueprint = {
  id: 'bloodtear-alchemist',
  name: 'Bloodtear Alchemist',
  description: '@On Enter@: Deal 1 damage to an enemy minion.',
  vfx: {
    spriteId: 'minions/neutral_bloodtear-alchemist',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_unit_deploy_2',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_bloodtearalchemist_attack_swing',
    takeDamage: 'sfx_neutral_bloodtearalchemist_hit',
    dealDamage: 'sfx_neutral_bloodtearalchemist_attack_impact',
    death: 'sfx_neutral_bloodtearalchemist_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 2,
  atk: 2,
  maxHp: 1,
  getTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, { required: false });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async event => {
        const [target] = event.data.targets;
        if (!target) return;
        await target.unit?.takeDamage(card, new AbilityDamage(card, 1));
      })
    );
  },
  async onPlay() {}
};
