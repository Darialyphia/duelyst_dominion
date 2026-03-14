import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { lyonarSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { MinionSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { MinionSimpleRetaliationBuffModifier } from '../../../../modifier/modifiers/simple-retaliation-buff.modifier';

export const suntideMaiden: MinionBlueprint = {
  id: 'suntide_maiden',
  name: 'Suntide Maiden',
  description: dedent`
  @Zeal@ : fully heal this unit at the end of your turn.
  @[lvl] 2 Bonus@: this has +1/+1/+0.
  `,
  vfx: {
    spriteId: 'minions/f1_suntide-maiden',
    sequences: {
      play(game, card, position) {
        return lyonarSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_immolation_b',
    walk: 'sfx_unit_run_magical_4',
    attack: 'sfx_neutral_gambitgirl_attack_swing',
    takeDamage: 'sfx_neutral_luxignis_hit',
    dealDamage: 'sfx_neutral_jaxtruesight_death',
    death: 'sfx_neutral_pandora_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.RARE,
  tags: [],
  runeCost: {},
  manaCost: 4,
  atk: 2,
  maxHp: 6,
  retaliation: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier('suntide-maiden-zeal', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_END,
            handler: async () => {
              await card.unit.heal(card, card.unit.maxHp - card.unit.remainingHp);
            }
          })
        ]
      })
    );

    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    const levelMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new MinionSimpleAttackBuffModifier('suntide-maiden-lvl-bonus-atk', game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );

    await card.modifiers.add(
      new MinionSimpleRetaliationBuffModifier(
        'suntide-maiden-lvl-bonus-ret',
        game,
        card,
        {
          amount: 1,
          mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
        }
      )
    );
  },
  async onPlay() {}
};
