import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion-card.entity';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { neutralSpawn } from '../../../card-vfx-sequences';

export const archonSpellbinder: MinionBlueprint = {
  id: 'archon-spellbinder',
  name: 'Archon Spellbinder',
  description: dedent`
  Enemy spells cost 1 more to play.
  `,
  vfx: {
    spriteId: 'minions/neutral_archon-spellbinder',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_summonlegendary',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_archonspellbinder_attack_swing',
    takeDamage: 'sfx_neutral_archonspellbinder_hit',
    dealDamage: 'sfx_neutral_archonspellbinder_attack_impact',
    death: 'sfx_neutral_archonspellbinder_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  manaCost: 6,
  runeCost: {
    yellow: 1,
    blue: 2
  },
  atk: 6,
  maxHp: 7,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    const DEBUFF_ID = 'archon-spellbinder-debuff';

    const aura = new Modifier<MinionCard>('archon-spellbinder-aura', game, card, {
      mixins: [
        new TogglableModifierMixin(game, () => card.location === 'board'),
        new CardAuraModifierMixin(game, {
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
                isRemovable: true,
                amount: 1
              })
            );
          },
          async onLoseAura(candidate) {
            await candidate.modifiers.remove(DEBUFF_ID, {
              source: card,
              force: true
            });
          }
        })
      ]
    });

    await card.modifiers.add(aura);
  },
  async onPlay() {}
};
