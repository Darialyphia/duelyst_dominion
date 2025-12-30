import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import {
  BackstabModifier,
  BackstabUnitModifier
} from '../../../../modifier/modifiers/backstab.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { UnitAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { StealthUnitModifier } from '../../../../modifier/modifiers/stealth.modifier';
import { songhaiSpawn } from '../../../card-vfx-sequences';

export const massacreArtist: MinionBlueprint = {
  id: 'massacre_artist',
  name: 'Massacre Artist',
  description: dedent`
  @Backstab (1)@.
  Allies with @Backstab@ have @Stealth@ and "When this unit backstabs, deal 2 more damage".
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
    death: 'sfx_neutral_syvrel_death.m4a  '
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 4,
  atk: 3,
  maxHp: 4,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new BackstabModifier(game, card, { damageBonus: 1 }));

    const interceptor = (val: number) => val + 2;

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('massacre-artist-ally-backstab', game, card, {
          mixins: [
            new UnitAuraModifierMixin(game, {
              isElligible(candidate) {
                return (
                  candidate.isAlly(card.unit) &&
                  candidate.modifiers.has(BackstabUnitModifier)
                );
              },
              async onGainAura(candidate) {
                const backstabModifier = candidate.modifiers.get(
                  BackstabUnitModifier
                ) as BackstabUnitModifier;
                backstabModifier.addBackstabAmountInterceptor(interceptor);
                await candidate.modifiers.add(
                  new StealthUnitModifier(game, card, {
                    isRemovable: false
                  })
                );
              },
              async onLoseAura(candidate) {
                const backstabModifier = candidate.modifiers.get(
                  BackstabUnitModifier
                ) as BackstabUnitModifier;
                backstabModifier.removeBackstabAmountInterceptor(interceptor);
                await candidate.modifiers.remove(StealthUnitModifier);
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
