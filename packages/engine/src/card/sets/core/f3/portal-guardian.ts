import { MinionSimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';

export const portalGuardian: MinionBlueprint = {
  id: 'portal-guardian',
  name: 'Portal Guardian',
  description: 'This has +1/+1/+0 for each adjacent allyminion.',
  vfx: { spriteId: 'minions/f3_portal-guardian' },
  sounds: {
    play: 'sfx_ui_booster_packexplode',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_f1_oserix_attack_swing',
    takeDamage: 'sfx_f1_oserix_hit',
    dealDamage: 'sfx_f1_oserix_attack_impact',
    death: 'sfx_f1_oserix_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.EPIC,
  tags: [TAGS.DERVISH],
  runeCost: {},
  manaCost: 3,
  atk: 1,
  maxHp: 6,
  retaliation: 0,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionSimpleAttackBuffModifier('portal-guardian-buff', game, card, {
        amount() {
          return (
            card.unit?.adjacentUnits.filter(unit => unit.isAlly(card.player)).length ?? 0
          );
        }
      })
    );
  },
  async onPlay() {}
};
