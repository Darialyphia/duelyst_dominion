import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { discover } from '../../../card-actions-utils';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const songweaver: MinionBlueprint = {
  id: 'songweaver',
  name: 'Songweaver',
  description: '@On Enter@: @Discover@ a Spell from your deck.',
  vfx: {
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    },
    spriteId: 'minions/neutral_songweaver'
  },
  sounds: {
    play: 'sfx_unit_deploy_2',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_bloodtearalchemist_attack_swing',
    takeDamage: 'sfx_neutral_spelljammer_hit',
    dealDamage: 'sfx_neutral_bloodtearalchemist_hit',
    death: 'sfx_neutral_bloodtearalchemist_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  runeCost: {},
  manaCost: 3,
  atk: 2,
  maxHp: 5,
  retaliation: 2,
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        const { selectedCard } = await discover(
          game,
          card,
          card.player.cardManager.deck.cards.filter(isSpell)
        );

        await selectedCard?.addToHand();
      })
    );
  },
  async onPlay() {}
};
