import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { IntimidateCardModifier } from '../../../../modifier/modifiers/intimidate.modifier';
import { RangedModifier } from '../../../../modifier/modifiers/ranged.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { GeneralBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { BackstabModifier } from '../../../../modifier/modifiers/backstab.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { MinionSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { GeneralCard } from '../../../entities/general-card.entity';
import { Game } from '../../../../game/game';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { AbilityDamage } from '../../../../utils/damage';
import { isDefined } from '@game/shared';

export const kaleosXaan: GeneralBlueprint = {
  id: 'kaleos-xaan',
  name: 'Kaleos Xaan',
  description: dedent`
  @[lvl] 2 Bonus@: @Backstab (1)@.
  @[lvl] 3 Bonus@: +2 Attack.
  @[lvl] 4 Bonus@: When a allied unit backstabs, deal 3 damage to the opponent.
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
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F2,
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
      new BackstabModifier(game, card, {
        damageBonus: 1,
        unitMixins: [new TogglableModifierMixin(game, () => levelMod.isActiveForLevel(2))]
      })
    );

    await card.modifiers.add(
      new MinionSimpleAttackBuffModifier('kaleos-atk-buff', game, card, {
        amount: 2,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActiveForLevel(3))]
      })
    );

    await card.modifiers.add(
      new Modifier<GeneralCard>('kaleos-lvl-4-effect', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => levelMod.isActiveForLevel(4)),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.MODIFIER_BACKSTAB,
            filter(event) {
              if (!event) return false;

              return (
                isDefined(card.player.deployedGeneral) &&
                event.data.unit.isAlly(card.player)
              );
            },
            async handler() {
              await card.player.opponent.takeDamage(card, new AbilityDamage(card, 3));
            }
          })
        ]
      })
    );
  }
};
