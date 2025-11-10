import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { MinionBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilStartOfNextTurnModifierMixin } from '../../../../modifier/mixins/until-start-of-next-turn.mixin';
import type { Unit } from '../../../../unit/unit.entity';
import type { AnyCard } from '../../../entities/card.entity';
import type { Game } from '../../../../game/game';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { MinionCard } from '../../../entities/minion-card.entity';
import type { GeneralCard } from '../../../entities/general-card.entity';
import { isMinionOrGeneral } from '../../../card-utils';
import dedent from 'dedent';
import { StealthModifier } from '../../../../modifier/modifiers/stealth.modifier';

class NeutralizedModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super('neutralized', game, source, {
      name: 'Neutralized',
      description: 'Cannot capture',
      icon: 'icons/keyword-cannot-capture',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canCapture',
          interceptor: () => false
        })
      ]
    });
  }
}

export const neutralizer: MinionBlueprint = {
  id: 'neutralizer',
  name: 'Neutralizer',
  description: dedent`
    @Stealth@
    Units nearby this cannot capture.`,
  cardIconId: 'minions/neutral_neutralizer',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.EPIC,
  tags: [],
  manaCost: 3,
  runeCost: {
    blue: 1,
    red: 1
  },
  atk: 3,
  cmd: 1,
  maxHp: 4,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ALLY_MINION, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new StealthModifier(game, card));
    await card.modifiers.add(
      new Modifier('neutralizer-aura', game, card, {
        mixins: [
          new AuraModifierMixin<MinionCard, MinionCard | GeneralCard>(game, {
            isElligible: candidate => {
              if (card.location !== 'board') return false;
              if (candidate.location !== 'board') return false;
              if (!isMinionOrGeneral(candidate)) return false;
              return card.unit.nearbyUnits.some(u => u.equals(candidate.unit));
            },
            async onGainAura(candidate) {
              console.log('applying neutralized to', candidate.unit.card.id);
              await candidate.unit.modifiers.add(new NeutralizedModifier(game, card));
            },
            async onLoseAura(candidate) {
              await candidate.unit.modifiers.remove(NeutralizedModifier);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
