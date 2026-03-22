import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES, TAGS } from '../../../card.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { CleaveCardModifier } from '../../../../modifier/modifiers/cleave.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { UniqueModifier } from '../../../../modifier/modifiers/unique.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';

export const argeonHighmane: MinionBlueprint = {
  id: 'argeon-highmane',
  name: 'Argeon Highmane',
  description: dedent`
  @Unique@.
  When an adjacent ally is destroyed, activate this minion.
  @[lvl] 3 bonus@: @Cleave@.
  `,
  vfx: {
    spriteId: 'generals/f1_argeon-highmane'
  },
  sounds: {
    play: 'sfx_unit_deploy',
    walk: 'sfx_unit_run_charge_4',
    attack: 'sfx_f1_general_attack_swing',
    dealDamage: 'sfx_f6_draugarlord_attack_impact_',
    takeDamage: 'sfx_f1_general_hit',
    death: 'sfx_f1general_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.LEGENDARY,
  tags: [TAGS.GENERAL],
  manaCost: 4,
  runeCost: {},
  atk: 3,
  maxHp: 5,
  retaliation: 2,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new UniqueModifier(game, card));
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
    const levelMod = card.modifiers.get(LevelBonusModifier)!;
    await card.modifiers.add(
      new CleaveCardModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('argeon-highmane-on-ally-destroyed', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_DESTROY,
              filter(event) {
                return (
                  !!event?.data.unit.isAlly(card.player) &&
                  !event?.data.unit.card.equals(card)
                );
              },
              async handler() {
                await card.unit?.activate();
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
