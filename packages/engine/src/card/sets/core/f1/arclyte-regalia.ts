import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import dedent from 'dedent';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { WhileEquipedModifier } from '../../../../modifier/modifiers/while-equiped';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import {
  PlayerAuraModifierMixin,
  UnitAuraModifierMixin
} from '../../../../modifier/mixins/aura.mixin';
import {
  PlayerInterceptorModifierMixin,
  UnitInterceptorModifierMixin
} from '../../../../modifier/mixins/interceptor.mixin';
import { PlayerArtifact } from '../../../../player/player-artifact.entity';

export const arclyteRegalia: ArtifactBlueprint = {
  id: 'arclyte-regalia',
  name: 'Arclyte Regalia',
  description: dedent`
  When  you or a minion would take damage, prevent all but 1 of that damage, and this loses 1 durability.
  `,
  vfx: { spriteId: 'artifacts/f1_arclyte-regalia' },
  sounds: {
    play: 'sfx_victory_crest'
  },
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  runeCost: {},
  manaCost: 4,
  durability: 3,
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  getTargets: anywhereTargetRules.getPreResponseTargets({
    min: 1,
    max: 1,
    allowRepeat: false
  }),
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileEquipedModifier(game, card, {
        modifier: new Modifier<PlayerArtifact>('arclyte-regalia-aura', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
              filter(event) {
                return !!event?.data.unit.isAlly(card.player);
              },
              async handler() {
                await card.artifact?.loseDurability(1);
              }
            }),
            new UnitAuraModifierMixin(game, card, {
              isElligible(candidate) {
                return candidate.isAlly(card.player);
              },
              getModifiers() {
                return [
                  new Modifier('arclyte-regalia-damage-prevention', game, card, {
                    mixins: [
                      new UnitInterceptorModifierMixin(game, {
                        key: 'damageReceived',
                        interceptor(value) {
                          return value > 1 ? 1 : value;
                        }
                      })
                    ]
                  })
                ];
              }
            }),
            new PlayerAuraModifierMixin(game, card, {
              isElligible(candidate) {
                return candidate.equals(card.player);
              },
              getModifiers() {
                return [
                  new Modifier('arclyte-regalia-damage-prevention', game, card, {
                    mixins: [
                      new PlayerInterceptorModifierMixin(game, {
                        key: 'damageReceived',
                        interceptor(value) {
                          return Math.max(value, 1);
                        }
                      })
                    ]
                  })
                ];
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {}
};
