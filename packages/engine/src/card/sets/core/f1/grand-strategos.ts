import dedent from 'dedent';
import {
  IsZealedModifierMixin,
  ZealUnitModifier
} from '../../../../modifier/modifiers/zeal.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import type { Unit } from '../../../../unit/unit.entity';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';

export const grandStrategos: MinionBlueprint = {
  id: 'grand_strategos',
  name: 'Grand Strategos',
  description: dedent`
  Your minions with @Zeal@ are always Zealed.
  @[lvl] 2 Bonus@: @On Enter@: Give allies with @Zeal@ +2 Health.
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
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 5,
  runeCost: {},
  atk: 3,
  maxHp: 6,
  retaliation: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        const zealedAllies = card.player.units.filter(ally =>
          ally.modifiers.has(ZealUnitModifier)
        );
        for (const ally of zealedAllies) {
          await ally.modifiers.add(
            new UnitSimpleHealthBuffModifier('grand-strategos-hp-buff', game, card, {
              amount: 2
            })
          );
        }
      })
    );

    const aura = new Modifier<Unit>('grand-strategos-aura', game, card, {
      mixins: [
        new UnitAuraModifierMixin(game, card, {
          isElligible(candidate) {
            return (
              candidate.modifiers.has(ZealUnitModifier) && candidate.isAlly(card.player)
            );
          },
          getModifiers() {
            return [
              new Modifier('grand-strategos-zeal-interceptor', game, card, {
                mixins: [new IsZealedModifierMixin(game, () => true)]
              })
            ];
          }
        })
      ]
    });

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: aura
      })
    );
  },
  async onPlay() {}
};
