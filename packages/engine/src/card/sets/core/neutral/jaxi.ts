import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnDestroyModifier } from '../../../../modifier/modifiers/on-destroy.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { MinionCard } from '../../../entities/minion-card.entity';
import { miniJax } from './mini-jax';

export const jaxi: MinionBlueprint = {
  id: 'jaxi',
  name: 'Jaxi',
  description: `@Dying Wish@: Summon a @${miniJax.name}@.`,
  vfx: {
    spriteId: 'minions/neutral_jaxi',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_neutral_sai_hit',
    walk: 'sfx_neutral_ubo_attack_swing',
    attack: 'sfx_neutral_jaxi_attack_swing',
    takeDamage: 'sfx_neutral_jaxi_hit',
    dealDamage: 'sfx_neutral_jaxi_impact',
    death: 'sfx_neutral_jaxi_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  runeCost: {},
  manaCost: 2,
  atk: 2,
  maxHp: 2,
  retaliation: 1,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnDestroyModifier(game, card, {
        async handler(event) {
          const minijaxCard = await card.player.generateCard<MinionCard>(
            miniJax.id,
            card.isFoil
          );
          await minijaxCard.playAt(
            game.boardSystem.getCellAt(event.data.destroyedAt)!,
            []
          );
        }
      })
    );
  },
  async onPlay() {}
};
