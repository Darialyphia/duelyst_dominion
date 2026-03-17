import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import { vetruvianSpawn } from '../../../card-vfx-sequences';
import dedent from 'dedent';
import { windDervish } from './wind-dervish';
import { StructureModifier } from '../../../../modifier/modifiers/structure.modifier';
import { SpawnModifier } from '../../../../modifier/modifiers/spawn.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { UnitAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { Unit } from '../../../../unit/unit.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const fireblazeObelysk: MinionBlueprint = {
  id: 'fireblaze-obelysk',
  name: 'Fireblaze Obelysk',
  description: dedent`
  @Structure@.
  @Spawn@: @${windDervish.name}@ (3 charges)
  Your ${windDervish.name}s have +1/+0/+1.
  @[lvl] 2 bonus@: this costs @[mana] 1@ less.
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
  runeCost: {},
  manaCost: 4,
  atk: 0,
  maxHp: 6,
  retaliation: 0,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    const levelMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new SimpleManacostModifier('fireblaze-obelysk-manacost', game, card, {
        amount: -1,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );

    await card.modifiers.add(new StructureModifier(game, card, {}));
    await card.modifiers.add(
      new SpawnModifier(game, card, {
        stacks: 3,
        blueprintId: windDervish.id
      })
    );
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier<Unit>('fireblaze-obelysk-aura', game, card, {
          mixins: [
            new UnitAuraModifierMixin(game, card, {
              isElligible(candidate) {
                return (
                  candidate.isAlly(card.player) &&
                  candidate.card.blueprintId === windDervish.id
                );
              },
              getModifiers() {
                return [
                  new UnitSimpleAttackBuffModifier(
                    'fireblaze-obelysk-attack-buff',
                    game,
                    card,
                    { amount: 1 }
                  )
                ];
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
