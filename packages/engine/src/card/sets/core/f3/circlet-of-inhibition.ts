import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import dedent from 'dedent';
import { TimelessModifier } from '../../../../modifier/modifiers/timeless.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import { ArtifactEffectModifierMixin } from '../../../../modifier/mixins/artifact-effect.mixin';
import { PlayerArtifact } from '../../../../player/player-artifact.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { PlayerInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { DurationModifierMixin } from '../../../../modifier/mixins/duration.mixin';

export const circletOfInhibition: ArtifactBlueprint = {
  id: 'circlet-of-inhibition',
  name: 'Circlet of Inhibition',
  description: dedent`
  @Timeless@.
  When an enemy attacks your general, your opponent must pay 2 or you gain 1 max mana until the end of your next turn.
  `,
  vfx: { spriteId: 'artifacts/f3_circlet-of-inhibition' },
  sounds: {},
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F3,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 2,
  durability: 3,
  runeCost: {
    blue: 1
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.MINION, {}),
  canPlay: () => true,
  getTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new TimelessModifier(game, card));

    const onAttackModifier = new Modifier<PlayerArtifact>(
      'circlet-of-inhibition-on-attack',
      game,
      card,
      {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.UNIT_BEFORE_ATTACK,
            filter(event) {
              return event?.data.target.equals(card.player.general) ?? false;
            },
            async handler(event) {
              if (!event) return;
              const opponent = event.data.unit.player;
              if (opponent.mana < 2) {
                await card.player.modifiers.add(
                  new Modifier('circlet-of-inhibition-mana-bonus', game, card, {
                    mixins: [
                      new PlayerInterceptorModifierMixin(game, {
                        key: 'maxMana',
                        interceptor: value => value + 1
                      }),
                      new DurationModifierMixin(game, 2)
                    ]
                  })
                );
              } else {
                console.log('spend mana');
                await opponent.spendMana(2);
              }
            }
          })
        ]
      }
    );

    await card.modifiers.add(
      new Modifier('circlet-of-inhibition', game, card, {
        mixins: [
          new ArtifactEffectModifierMixin(game, {
            async onApplied(artifact) {
              await artifact.modifiers.add(onAttackModifier);
            },
            async onRemoved(artifact) {
              await artifact.modifiers.remove(onAttackModifier);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
