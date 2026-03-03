import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { RangedModifier } from '../../../../modifier/modifiers/ranged.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { singleMinionTargetRules } from '../../../card-utils';
import { AbilityDamage } from '../../../../utils/damage';

export const arrowWhistler: MinionBlueprint = {
  id: 'arrow-whistler',
  name: 'Arrow Whistler',
  description: dedent`
  @Ranged@.
  @On Enter@: If this is on the front row, deal 2 damage to a unit in the same column.
  `,
  vfx: {
    spriteId: 'minions/neutral_arrowwhistler',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_blindscorch',
    walk: 'sfx_neutral_firestarter_impact',
    attack: 'sfx_neutral_firespitter_attack_swing',
    takeDamage: 'sfx_neutral_firespitter_hit',
    dealDamage: 'sfx_neutral_firespitter_attack_impact',
    death: 'sfx_neutral_firespitter_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  runeCost: {},
  manaCost: 4,
  atk: 2,
  maxHp: 5,
  retaliation: 2,
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RangedModifier(game, card, {}));
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async event => {
        if (!event.data.unit.isOnFrontRow) return;
        const [target] = await singleMinionTargetRules.getPreResponseTargets(game, card, {
          predicate: unit =>
            unit.isEnemy(card.player) && unit.position.x === event.data.unit.position.x,
          required: false
        });
        if (!target) return;

        await target.unit!.takeDamage(card, new AbilityDamage(card, 2));
      })
    );
  },
  async onPlay() {}
};
