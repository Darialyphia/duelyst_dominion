import dedent from 'dedent';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import {
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  FACTIONS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion-card.entity';
import type { Unit } from '../../../../unit/unit.entity';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';

export const archonSpellbinder: MinionBlueprint = {
  id: 'archon-spellbinder',
  name: 'Archon Spellbinder',
  description: dedent`
  Enemy spells cost 1 more to play.
  `,
  vfx: {
    spriteId: 'minions/neutral_archon-spellbinder',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_summonlegendary',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_archonspellbinder_attack_swing',
    takeDamage: 'sfx_neutral_archonspellbinder_hit',
    dealDamage: 'sfx_neutral_archonspellbinder_attack_impact',
    death: 'sfx_neutral_archonspellbinder_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  manaCost: 6,
  atk: 4,
  maxHp: 7,
  retaliation: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>(game, card, {
        modifier: new Modifier<Unit>('archon-spellbinder-aura', game, card, {
          mixins: [
            new CardAuraModifierMixin(game, card, {
              isElligible(targetCard) {
                return (
                  isSpell(targetCard) &&
                  targetCard.isEnemy(card) &&
                  targetCard.location === CARD_LOCATIONS.HAND
                );
              },
              getModifiers: () => [
                new SimpleManacostModifier('archon-spellbinder-debuff', game, card, {
                  amount: 1
                })
              ]
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
