import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion-card.entity';

export const archonSpellbinder: MinionBlueprint = {
  id: 'archon-spellbinder',
  name: 'Archon Spellbinder',
  description: dedent`
  @Consume@ @[rune:blue]@
  Enemy spells cost 1 more to play.
  `,
  cardIconId: 'minions/neutral_archon-spellbinder',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  manaCost: 6,
  runeCost: {
    red: 1,
    blue: 3
  },
  atk: 6,
  cmd: 2,
  maxHp: 7,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION),
  canPlay: () => true,
  async onInit(game, card) {
    const DEBUFF_ID = 'archon-spellbinder-debuff';
    await card.modifiers.add(
      new Modifier<MinionCard>('archon-spellbinder-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(targetCard) {
              return (
                isSpell(targetCard) &&
                targetCard.isEnemy(card) &&
                targetCard.location === 'hand'
              );
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(
                new SimpleManacostModifier(DEBUFF_ID, game, card, {
                  amount: 1
                })
              );
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(DEBUFF_ID, card);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
