import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import {
  IsZealedModifierMixin,
  ZealUnitModifier
} from '../../../../modifier/modifiers/zeal.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { Unit } from '../../../../unit/unit.entity';
import { UnitSimpleRetaliationBuffModifier } from '../../../../modifier/modifiers/simple-retaliation-buff.modifier';

export const grandStrategos: MinionBlueprint = {
  id: 'grand_strategos',
  name: 'Grand Strategos',
  description: dedent`
  Your minions with @Zeal@ have +1/+1/+1 and are always Zealed.
  `,
  vfx: {
    spriteId: 'minions/f1_grand-strategos',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_ui_booster_packexplode',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f2_jadeogre_attack_swing',
    takeDamage: 'sfx_f3_dunecaster_hit',
    dealDamage: 'sfx_f3_dunecaster_impact',
    death: 'sfx_f3_dunecaster_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.COMMON,
  tags: [],
  manaCost: 5,
  runeCost: {},
  atk: 3,
  maxHp: 6,
  retaliation: 3,
  canPlay: () => true,
  async onInit(game, card) {
    const HP_BUFF_ID = 'grand-strategos-hp-buff';
    const ATTACK_BUFF_ID = 'grand-strategos-attack-buff';
    const RETALIATION_BUFF_ID = 'grand-strategos-retaliation-buff';

    const ZEAL_INTERCEPTOR = () => true;

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier<Unit>('grand-strategos-aura', game, card, {
          mixins: [
            new UnitAuraModifierMixin(game, card, {
              isElligible(candidate) {
                return (
                  candidate.modifiers.has(ZealUnitModifier) &&
                  candidate.isAlly(card.player)
                );
              },
              getModifiers() {
                return [
                  new Modifier('grand-strategos-zeal-interceptor', game, card, {
                    mixins: [new IsZealedModifierMixin(game, ZEAL_INTERCEPTOR)]
                  }),
                  new UnitSimpleHealthBuffModifier(HP_BUFF_ID, game, card, {
                    amount: 1
                  }),
                  new UnitSimpleAttackBuffModifier(ATTACK_BUFF_ID, game, card, {
                    amount: 1
                  }),
                  new UnitSimpleRetaliationBuffModifier(RETALIATION_BUFF_ID, game, card, {
                    amount: 1
                  })
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
