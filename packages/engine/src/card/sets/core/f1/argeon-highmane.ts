import { CompositeAOEShape } from '../../../../aoe/composite.aoe-shape';
import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import type { GeneralBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const argeonHighmane: GeneralBlueprint = {
  id: 'argeon-highmane',
  name: 'Argeon Highmane',
  description: '',
  cardIconId: 'f1_argeon-highmane',
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  atk: 2,
  maxHp: 25,
  abilities: [
    {
      id: 'f1_argeon-highmane_ability_1',
      description: '@Ability (2) : Equip a 1 cost artifact from your deck.',
      manaCost: 2,
      canUse: () => true,
      getCooldown: game => game.config.GENERAL_ABILITY_COOLDOWN,
      getMaxUses: game => game.config.GENERAL_ABILITY_MAX_USES,
      getAoe: () => new NoAOEShape(),
      getTargets: async () => [],
      async onResolve(game, card) {
        const artifacts = card.player.cardManager.deck.cards.filter(
          c => c.kind === CARD_KINDS.ARTIFACT && c.manaCost === 1
        );
        if (!artifacts.length) return;

        const [choice] = await game.interaction.chooseCards({
          player: card.player,
          source: card,
          choices: artifacts,
          label: 'Choose an artifact to equip',
          minChoiceCount: 1,
          maxChoiceCount: 1
        });

        await choice.play();
      }
    },
    {
      id: 'f1_argeon-highmane_ability_2',
      description: '@Ability (5) : Give Ally minions "@Zeal@: +2/+0".',
      manaCost: 5,
      canUse: () => true,
      getCooldown: game => game.config.GENERAL_ABILITY_COOLDOWN,
      getMaxUses: game => game.config.GENERAL_ABILITY_MAX_USES,
      getAoe(game, card) {
        return new CompositeAOEShape(
          card.player.minions.map(minion => ({
            shape: new PointAOEShape(game, card.player),
            getPoints: () => [minion.position]
          }))
        );
      },
      getTargets: async () => [],
      async onResolve(game, card) {
        for (const minion of card.player.minions) {
          const zealModifier = new ZealModifier(game, card, {
            mixins: [
              new UnitInterceptorModifierMixin(game, {
                key: 'atk',
                interceptor: value => {
                  return value + 2;
                }
              })
            ]
          });
          await minion.modifiers.add(zealModifier);
        }
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
