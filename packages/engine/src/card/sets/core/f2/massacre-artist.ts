import dedent from 'dedent';
import {
  BackstabAmountModifierMixin,
  BackstabModifier,
  BackstabUnitModifier
} from '../../../../modifier/modifiers/backstab.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { UnitAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import {
  StealthModifier,
  StealthUnitModifier
} from '../../../../modifier/modifiers/stealth.modifier';
import { songhaiSpawn } from '../../../card-vfx-sequences';
import type { Unit } from '../../../../unit/unit.entity';
import { RuneCostToggleModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const massacreArtist: MinionBlueprint = {
  id: 'massacre_artist',
  name: 'Massacre Artist',
  description: dedent /*html*/ `
  <rt-keyword>Backstab 1</rt-keyword> <rt-keyword>Stealth</rt-keyword>
  <rt-runes runes="might,focus,focus"></rt-runes> Allies with <rt-keyword>Backstab</rt-keyword> have "When this unit backstabs, deal 1 more damage".
  `,
  vfx: {
    spriteId: 'minions/f2_massacre-artist',
    sequences: {
      play(game, card, position) {
        return songhaiSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_deathstrikeseal',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_redsynja_attack_swing',
    takeDamage: 'sfx_f2_kaidoassassin_hit',
    dealDamage: 'sfx_neutral_syvrel_attack_impact',
    death: 'sfx_neutral_syvrel_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 4,
  atk: 3,
  maxHp: 5,
  retaliation: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new BackstabModifier(game, card, { damageBonus: 1 }));
    await card.modifiers.add(new StealthModifier(game, card));

    const interceptor = (val: number) => val + 1;

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier<Unit>('massacre-artist-ally-backstab', game, card, {
          mixins: [
            new RuneCostToggleModifierMixin(game, card, { might: 1, focus: 2 }),
            new UnitAuraModifierMixin(game, card, {
              isElligible(candidate) {
                return (
                  candidate.isAlly(card.unit) &&
                  candidate.modifiers.has(BackstabUnitModifier)
                );
              },
              getModifiers: () => [
                new Modifier('massacre-artist-backstab-bonus', game, card, {
                  mixins: [new BackstabAmountModifierMixin(game, interceptor)]
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
