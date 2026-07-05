import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import { vetruvianSpawn } from '../../../card-vfx-sequences';
import dedent from 'dedent';
import { windDervish } from './wind-dervish';
import { StructureModifier } from '../../../../modifier/modifiers/structure.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { UnitAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { Unit } from '../../../../unit/unit.entity';
import { spawnDervish } from '../../../card-utils';

export const fireblazeObelysk: MinionBlueprint = {
  id: 'fireblaze-obelysk',
  name: 'Fireblaze Obelysk',
  description: dedent /*html*/ `
  <rt-keyword>Structure</rt-keyword>
  Your <rt-card>${windDervish.name}</rt-card>s have +1/+0/+1.
  `,
  vfx: {
    spriteId: 'minions/f3_fireblaze-obelysk',
    sequences: {
      play(game, card, position) {
        return vetruvianSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_divineblood',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_monsterdreamoracle_attack_swing',
    takeDamage: 'sfx_neutral_monsterdreamoracle_hit',
    dealDamage: 'sfx_f1_general_attack_impact',
    death: 'sfx_neutral_golembloodshard_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.RARE,
  tags: [TAGS.OBELYSK],
  manaCost: 4,
  atk: 0,
  maxHp: 4,
  retaliation: 0,
  canPlay: () => true,
  abilities: [spawnDervish()],
  async onInit(game, card) {
    await card.modifiers.add(new StructureModifier(game, card, {}));

    const dervishBuff = () =>
      new UnitSimpleAttackBuffModifier('fireblaze-obelysk-attack-buff', game, card, {
        amount: 1
      });

    const aura = new UnitAuraModifierMixin(game, card, {
      isElligible(candidate) {
        return (
          candidate.isAlly(card.player) && candidate.card.blueprintId === windDervish.id
        );
      },
      getModifiers() {
        return [dervishBuff()];
      }
    });

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier<Unit>('fireblaze-obelysk-aura', game, card, {
          mixins: [aura]
        })
      })
    );
  },
  async onPlay() {}
};
