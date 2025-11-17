import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UnitSimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import type { GeneralBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import type { GeneralCard } from '../../../entities/general-card.entity';
import type { MinionCard } from '../../../entities/minion-card.entity';

export const argeonHighmane: GeneralBlueprint = {
  id: 'argeon-highmane',
  name: 'Argeon Highmane',
  description: 'Allied minions nearby captured Shrines have +1 Atk and +1 Hp.',
  cardIconId: 'generals/f1_argeon-highmane',
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  atk: 2,
  cmd: 1,
  maxHp: 15,
  abilities: [],
  async onInit(game, card) {
    const ATK_BUFF_ID = 'argeon-highmane-atk-buff';
    const HP_BUFF_ID = 'argeon-highmane-hp-buff';
    await card.modifiers.add(
      new Modifier('argeon-highmane-aura', game, card, {
        mixins: [
          new AuraModifierMixin<GeneralCard, MinionCard | GeneralCard>(game, {
            isElligible: candidate => {
              if (!card.unit) return false;
              if (card.location !== 'board') return false;
              if (candidate.location !== 'board') return false;
              if (candidate.isEnemy(card)) return false;
              if (!isMinion(candidate)) return false;
              return game.boardSystem.shrines
                .filter(s => s.player?.equals(card.player))
                .map(s => s.neighborUnits)
                .flat()
                .some(u => u.equals(candidate.unit));
            },
            async onGainAura(candidate) {
              await candidate.unit.modifiers.add(
                new UnitSimpleAttackBuffModifier(ATK_BUFF_ID, game, card, {
                  amount: 1
                })
              );
              await candidate.unit.modifiers.add(
                new UnitSimpleHealthBuffModifier(HP_BUFF_ID, game, card, {
                  amount: 1
                })
              );
            },
            async onLoseAura(candidate) {
              await candidate.unit?.modifiers.remove(ATK_BUFF_ID);
              await candidate.unit?.modifiers.remove(HP_BUFF_ID);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
