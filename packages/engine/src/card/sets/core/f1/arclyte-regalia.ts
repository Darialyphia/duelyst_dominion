import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { CelerityUnitModifier } from '../../../../modifier/modifiers/celerity.modifier';
import { PlayerArtifact } from '../../../../player/player-artifact.entity';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import type { Unit } from '../../../../unit/unit.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';

export const arclyteRegalia: ArtifactBlueprint = {
  id: 'arclyte-regalia',
  name: 'Arclyte Regalia',
  description: dedent`
  Your general has +2/+0.
  The first time your general takes damage each turn, reduce that damage by 2.
  `,
  sprite: { id: 'artifacts/f1_arclyte-regalia' },
  sounds: {
    play: 'sfx_victory_crest.m4a'
  },
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  manaCost: 4,
  durability: 3,
  runeCost: {},
  getAoe: (game, card) =>
    new PointAOEShape(TARGETING_TYPE.ALLY_GENERAL, {
      override: card.player.general
    }),
  canPlay: () => true,
  getTargets: anywhereTargetRules.getPreResponseTargets({
    min: 1,
    max: 1,
    allowRepeat: false
  }),
  async onInit() {},
  async onPlay(game, card, { artifact }) {
    const MODIFIER_ID = 'arclyte-regalia-buff';

    let hasProccedThisTurn = false;
    const buff = new Modifier<Unit>('arclyte-regalia-buff', game, card, {
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: value => value + 2
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'damageReceived',
          interceptor: value => {
            if (hasProccedThisTurn) {
              return value;
            }
            return Math.max(0, value - 2);
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
          filter: event => {
            if (!event) return false;
            return event.data.unit.equals(card.player.general);
          },
          handler() {
            if (hasProccedThisTurn) return;
            hasProccedThisTurn = true;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_START_TURN,
          handler() {
            hasProccedThisTurn = false;
          }
        })
      ]
    });

    await artifact.modifiers.add(
      new Modifier<PlayerArtifact>('arclyte-regalia', game, card, {
        mixins: [
          new UnitAuraModifierMixin(game, {
            isElligible(candidate) {
              return candidate.equals(card.player.general);
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(buff);
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(MODIFIER_ID);
            }
          })
        ]
      })
    );
  }
};
