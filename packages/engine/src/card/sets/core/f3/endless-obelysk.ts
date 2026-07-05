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
import { etherealObelysk } from './ethereal-obelysk';
import { spawnDervish } from '../../../card-utils';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { RUNES } from '../../../../player/player.enums';

export const endlessObelysk: MinionBlueprint = {
  id: 'endless-obelysk',
  name: 'Endless Obelysk',
  description: dedent /*html*/ `
  <rt-keyword>Structure</rt-keyword>
  <br />
  <rt-trigger>On Turn End</rt-trigger>You may consume <rt-runes runes="wisdom"></rt-runes> to put an ${etherealObelysk.name} in your hand and reduce its cost by 1.
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
  manaCost: 4,
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
                const canTrigger = card.player.runeManager.has({ wisdom: 1 });
                if (!canTrigger) return;

                const shouldTrigger = await askMandatoryYesNoQuestion({
                  game,
                  card,
                  questionId: 'endless_obelysk_trigger',
                  label:
                    'Do you want to consume a wisdom rune to put an Ethereal Obelysk in your hand ?',
                  timeoutFallback: 'no'
                });

                if (!shouldTrigger) return;
                await card.player.runeManager.remove([RUNES.WISDOM]);
                const obelysk = await card.player.generateCard(
                  etherealObelysk.id,
                  card.isFoil
                );
                await obelysk.modifiers.add(
                  new SimpleManacostModifier('endless_obelysk_mana_cost', game, obelysk, {
                    amount: -1
                  })
                );
                await obelysk.addToHand();
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
