import dedent from 'dedent';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { BackstabModifier } from '../../../../modifier/modifiers/backstab.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { UniqueModifier } from '../../../../modifier/modifiers/unique.modifier';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';

export const kaleosXaan: MinionBlueprint = {
  id: 'kaleos-xaan',
  name: 'Kaleos Xaan',
  description: dedent`
  @Unique@, @Backstab (1)@.
  @[lvl] 2 Bonus@: @On Enter@: Deal 1 damage to to enemy minions.
  @[lvl] 3 Bonus@: @Rush@.
  `,
  vfx: {
    spriteId: 'generals/f2_kaleos-xaan'
  },
  sounds: {
    play: 'sfx_unit_deploy_1',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f2general_attack_swing',
    takeDamage: 'sfx_f2general_hit_2',
    dealDamage: 'sfx_f2general_attack_impact_3',
    death: 'sfx_f2general_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
  rarity: RARITIES.LEGENDARY,
  tags: [TAGS.GENERAL],
  manaCost: 5,
  runeCost: {},
  atk: 4,
  maxHp: 4,
  retaliation: 1,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new UniqueModifier(game, card));
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    const levelMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new BackstabModifier(game, card, {
        damageBonus: 1
      })
    );

    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, {
        handler: async () => {
          for (const minion of card.player.enemyUnits) {
            await minion.takeDamage(card, new AbilityDamage(card, 1));
          }
        },
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActiveForLevel(2))]
      })
    );
    await card.modifiers.add(
      new RushModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActiveForLevel(3))]
      })
    );
  },
  async onPlay() {}
};
