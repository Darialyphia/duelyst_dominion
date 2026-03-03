import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { emptySpacesTargetRules, singleMinionTargetRules } from '../../../card-utils';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const repulsorBeast: MinionBlueprint = {
  id: 'repulsor-beast',
  name: 'Repulsor Beast',
  description:
    '@On Enter@: Move an enemy minion on the same row as this to an empty space.',
  vfx: {
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    },
    spriteId: 'minions/neutral_repulsor-beast'
  },
  sounds: {
    play: 'sfx_unit_deploy_3',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f6_voiceofthewind_attack_swing',
    takeDamage: 'sfx_neutral_spelljammer_hit',
    dealDamage: 'sfx_neutral_spelljammer_attack_impact',
    death: 'sfx_neutral_spelljammer_death'
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
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async event => {
        const [targetPosition] = await singleMinionTargetRules.getPreResponseTargets(
          game,
          card,
          {
            predicate: unit =>
              unit.isEnemy(card.player) && unit.position.x === event.data.unit.position.x,
            required: false
          }
        );
        if (!targetPosition) return;

        const [destination] = await emptySpacesTargetRules.getPreResponseTargets({
          min: 1,
          max: 1
        })(game, card, {
          predicate: cell => cell.player?.equals(card.player.opponent) ?? false,
          getLabel() {
            return `${card.blueprint.name} : Select the space to teleport to`;
          }
        });

        if (!destination) return;

        const unit = targetPosition.unit;
        if (!unit) return;

        if (!destination) return;

        await unit.teleport(destination);
      })
    );
  },
  async onPlay() {}
};
