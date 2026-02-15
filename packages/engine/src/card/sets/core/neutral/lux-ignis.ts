import dedent from 'dedent';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { RangedModifier } from '../../../../modifier/modifiers/ranged.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { neutralSpawn } from '../../../card-vfx-sequences';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { Modifier } from '../../../../modifier/modifier.entity';

export const luxIgnis: MinionBlueprint = {
  id: 'lux-ignis',
  name: 'Lux Ignis',
  description: dedent`
  @Ranged@.
  At the end of the turn, if this is not exhausted, heal adjacent allies for 2.`,
  vfx: {
    spriteId: 'minions/neutral_lux-ignis',
    sequences: {
      play(game, card, position) {
        return neutralSpawn(position);
      }
    }
  },
  sounds: {
    play: 'sfx_ui_booster_packexplode',
    walk: 'sfx_neutral_ladylocke_attack_impact',
    attack: 'sfx_neutral_luxignis_attack_swing',
    takeDamage: 'sfx_neutral_luxignis_hit',
    dealDamage: 'sfx_neutral_luxignis_attack_impact',
    death: 'sfx_neutral_luxignis_death'
  },
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.EPIC,
  tags: [],
  runeCost: {},
  manaCost: 4,
  atk: 2,
  maxHp: 5,
  retaliation: 2,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RangedModifier(game, card, {}));
    await card.modifiers.add(
      new Modifier('lux-ignis-heal', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_END,
            async handler() {
              if (card.unit.isExhausted) return;

              const alliesToHeal = await card.unit.adjacentUnits.filter(u =>
                u.isAlly(card.player)
              );
              for (const ally of alliesToHeal) {
                await ally.heal(card, 2);
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
