import type { Point } from '@game/shared';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { MinionCard } from '../../../entities/minion-card.entity';
import { miniJax } from './mini-jax';
import dedent from 'dedent';
import { RangedModifier } from '../../../../modifier/modifiers/ranged.modifier';

export const jaxTruesight: MinionBlueprint = {
  id: 'jax-truesight',
  name: 'Jax Truesight',
  description: dedent`
  @Ranged@.
  @On Enter@: Summon a ${miniJax.name}@ on every empty space in your back row.`,
  vfx: {
    spriteId: 'minions/neutral_jax-truesight',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_summonlegendary',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_jaxtruesight_attack_swing',
    takeDamage: 'sfx_neutral_jaxtruesight_hit',
    dealDamage: 'sfx_neutral_jaxtruesight_attack_impact',
    death: 'sfx_neutral_jaxtruesight_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  runeCost: {},
  manaCost: 6,
  atk: 2,
  maxHp: 3,
  retaliation: 1,
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RangedModifier(game, card, {}));
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        await game.once(GAME_EVENTS.MINION_AFTER_SUMMON, async () => {
          const backRowCells = game.boardSystem
            .getBackRowForPlayer(card.player)
            .filter(cell => cell.isEmpty);

          for (const cell of backRowCells) {
            const minijaxCard = await card.player.generateCard<MinionCard>(
              miniJax.id,
              card.isFoil
            );
            await minijaxCard.playAt(cell);
          }
        });
      })
    );
  },
  async onPlay() {}
};
