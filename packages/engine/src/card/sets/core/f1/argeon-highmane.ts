import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { IntimidateCardModifier } from '../../../../modifier/modifiers/intimidate.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { GeneralBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { MinionSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { MinionSimpleRetaliationBuffModifier } from '../../../../modifier/modifiers/simple-retaliation-buff.modifier';
import { MinionSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { InvulnerableCardModifier } from '../../../../modifier/modifiers/invulnerable.modifier';
import { ZealUnitModifier } from '../../../../modifier/modifiers/zeal.modifier';

export const argeonHighmane: GeneralBlueprint = {
  id: 'argeon-highmane',
  name: 'Argeon Highmane',
  description: dedent`
  @[lvl] 2 Bonus@: +1 Attack.
  @[lvl] 3 Bonus@: +1/+1/+1 and @Intimidate (2)@. 
  @[lvl] 4 Bonus@: has @Invulnerable@ while you have a minion with @Zeal@ active.
  `,
  vfx: {
    spriteId: 'generals/f1_argeon-highmane'
  },
  sounds: {
    play: 'sfx_unit_deploy',
    walk: 'sfx_unit_run_charge_4',
    attack: 'sfx_f1_general_attack_swing',
    dealDamage: 'sfx_f6_draugarlord_attack_impact_',
    takeDamage: 'sfx_f1_general_hit',
    death: 'sfx_f1general_death'
  },
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 3,
  runeCost: {},
  atk: 2,
  maxHp: 5,
  retaliation: 2,
  abilities: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_GENERAL, {}),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    const levelMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new IntimidateCardModifier(game, card, {
        threshold: 2,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActiveForLevel(3))]
      })
    );
    await card.modifiers.add(
      new MinionSimpleAttackBuffModifier('argeon-atk-buff', game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActiveForLevel(2))]
      })
    );
    await card.modifiers.add(
      new MinionSimpleRetaliationBuffModifier('argeon-ret-buff', game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActiveForLevel(3))]
      })
    );
    await card.modifiers.add(
      new MinionSimpleHealthBuffModifier('argeon-hp-buff', game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActiveForLevel(3))]
      })
    );
    await card.modifiers.add(
      new InvulnerableCardModifier(game, card, {
        mixins: [],
        unitMixins: [
          new TogglableModifierMixin(game, () => {
            const hasZealMinion = card.player.minions.some(minion => {
              const zealMod = minion.modifiers.get(ZealUnitModifier);
              return zealMod?.isZealed;
            });
            return levelMod.isActiveForLevel(4) && hasZealMinion;
          })
        ]
      })
    );
  }
};
