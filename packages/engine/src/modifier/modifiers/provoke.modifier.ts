import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { AuraModifierMixin } from '../mixins/aura.mixin';
import { isMinionOrGeneral } from '../../card/card-utils';
import type { GeneralCard } from '../../card/entities/general-card.entity';

const PROVOKED_MODIFIER_ID = 'provoked';

export class ProvokeModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.PROVOKE.id, game, source, {
      name: KEYWORDS.PROVOKE.name,
      description: KEYWORDS.PROVOKE.description,
      icon: 'icons/keyword-provoke.png',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROVOKE),
        new AuraModifierMixin<MinionCard, MinionCard | GeneralCard>(game, {
          isElligible: candidate => {
            if (this.target.location !== 'board') return false;
            if (!isMinionOrGeneral(candidate)) return false;
            if (!candidate.unit) return false;
            if (candidate.location !== 'board') return false;

            return (
              this.game.boardSystem.getDistance(
                this.target.unit.position,
                candidate.unit.position
              ) === 1
            );
          },
          onGainAura: async candidate => {
            await this.addProvoke(candidate);
          },
          onLoseAura: async candidate => {
            await candidate.unit.modifiers.remove(PROVOKED_MODIFIER_ID);
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }

  private async addProvoke(candidate: MinionCard | GeneralCard): Promise<void> {
    await candidate.unit.modifiers.add(
      new Modifier(PROVOKED_MODIFIER_ID, this.game, this.source, {
        mixins: [
          new UnitInterceptorModifierMixin(this.game, {
            key: 'canMove',
            interceptor: () => false
          }),
          new UnitInterceptorModifierMixin(this.game, {
            key: 'canAttack',
            interceptor: (value, { target }) => {
              if (!value) return value;

              return target.modifiers.has(KEYWORDS.PROVOKE.id);
            }
          })
        ]
      })
    );
  }
}
