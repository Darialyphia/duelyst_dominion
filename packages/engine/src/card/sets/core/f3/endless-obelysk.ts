import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import dedent from 'dedent';
import { StructureModifier } from '../../../../modifier/modifiers/structure.modifier';
import { SpawnUnitModifier } from '../../../../modifier/modifiers/spawn.modifier';
import { vetruvianSpawn } from '../../../card-vfx-sequences';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';

export const endlessObelysk: MinionBlueprint = {
  id: 'endless-obelysk',
  name: 'Endless Obelysk',
  description: dedent`
  @Structure@.
  At the end  of each turn, your Obleysks gain 1 @Spawn@ charge.
  `,
  vfx: {
    spriteId: 'minions/f3_endless-obelysk',
    sequences: {
      play(game, card, position) {
        return vetruvianSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_spell_divineblood',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_monsterdreamoracle_attack_swing',
    takeDamage: 'sfx_neutral_monsterdreamoracle_hit',
    dealDamage: 'sfx_f1_general_attack_impact',
    death: 'sfx_neutral_golembloodshard_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.EPIC,
  tags: [TAGS.OBELYSK],
  runeCost: {},
  manaCost: 3,
  atk: 0,
  maxHp: 4,
  retaliation: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new StructureModifier(game, card, {}));
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('endless_obelysk_spawn_charge', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.TURN_END,
              async handler() {
                const obelysks = card.player.units.filter(u =>
                  u.card.tags.includes(TAGS.OBELYSK)
                );
                for (const obelysk of obelysks) {
                  const spawnMod = obelysk.modifiers.get(SpawnUnitModifier);
                  if (spawnMod) {
                    spawnMod.charges += 1;
                  }
                }
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
