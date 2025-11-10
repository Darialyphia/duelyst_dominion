import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { UnitEffectModifierMixin } from '../../../../modifier/mixins/unit-effect.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { FlyingModifier } from '../../../../modifier/modifiers/flying.modifiers';
import { MinionOnCaptureModifier } from '../../../../modifier/modifiers/on-capture.modifier';
import { UnitSimpleCmdBuffModifier } from '../../../../modifier/modifiers/simple-cmd-buff-modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { Unit } from '../../../../unit/unit.entity';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import {
  CARD_EVENTS,
  CARD_KINDS,
  CARD_SETS,
  FACTIONS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion-card.entity';

export const songweaver: MinionBlueprint = {
  id: 'songweaver',
  name: 'Songweaver',
  description:
    'When you play your first spell each turn, this gains 1 Commandment and @Flying@ until the end of turn.',
  cardIconId: 'minions/neutral_songweaver',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 3,
  runeCost: {
    blue: 2
  },
  atk: 2,
  cmd: 1,
  maxHp: 5,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    const UNIT_MODIFIER_ID = 'song-weaver-unit-spellwatch';

    const unitModifier = new Modifier<Unit>(UNIT_MODIFIER_ID, game, card, {
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: CARD_EVENTS.CARD_AFTER_PLAY,
          filter: event => {
            if (card.player.isTurnPlayer) return false;
            return event.data.card.player.equals(card.player) && isSpell(event.data.card);
          },
          frequencyPerPlayerTurn: 1,
          handler: async () => {
            await unitModifier.target.modifiers.add(
              new UnitSimpleCmdBuffModifier('song-weaver-cmd-buff', game, card, {
                amount: 1,
                mixins: [new UntilEndOfTurnModifierMixin(game)]
              })
            );
            await (unitModifier.target.card as MinionCard).modifiers.add(
              new FlyingModifier(game, card, {
                mixins: [new UntilEndOfTurnModifierMixin(game)]
              })
            );
          }
        })
      ]
    });

    await card.modifiers.add(
      new Modifier('song-weaver-card-spellwatch', game, card, {
        mixins: [
          new UnitEffectModifierMixin(game, {
            onApplied: async unit => {
              await unit.modifiers.add(unitModifier);
            },
            onRemoved: async unit => {
              await unit.modifiers.remove(UNIT_MODIFIER_ID);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
