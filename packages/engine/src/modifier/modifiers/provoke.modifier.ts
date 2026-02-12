import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitAuraModifierMixin } from '../mixins/aura.mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';
import { DAMAGE_TYPES } from '../../utils/damage';
import type { UnitReceiveDamageEvent } from '../../unit/unit-events';
import { Player } from '../../player/player.entity';

export class ProvokeModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.PROVOKE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROVOKE),
        new UnitEffectModifierMixin(game, {
          getModifier: () => new ProvokeUnitModifier(game, this.initialSource)
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class ProvokeUnitModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.PROVOKE.id, game, source, {
      name: KEYWORDS.PROVOKE.name,
      description: KEYWORDS.PROVOKE.description,
      icon: 'icons/keyword-provoke',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_BEFORE_ATTACK,
          filter: event => {
            if (!event) return false;
            if (event.data.target instanceof Player) return false;
            if (event.data.target.isEnemy(this.target)) return false;
            return this.target.adjacentUnits.some(u => u.equals(event.data.target));
          },
          handler: async event => {
            if (!event) return;
            const target = event.data.target as Unit;
            const { x: targetX, y: targetY } = target.position;
            const { x, y } = this.target.position;
            this.target.position.x = targetX;
            this.target.position.y = targetY;
            target.position.x = x;
            target.position.y = y;
          }
        })
      ]
    });
  }

  private async onDamageReceived(event: UnitReceiveDamageEvent, candidate: Unit) {
    if (!event) return;
    const removeInterceptor = await candidate.addInterceptor(
      'damageReceived',
      (value, ctx) => (ctx.damage.type === DAMAGE_TYPES.COMBAT ? 0 : value)
    );
    const stop = this.game.on(GAME_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE, async e => {
      if (e?.data.unit.equals(candidate)) {
        await removeInterceptor();
        stop();
      }
    });
    const adjacentAlliesWithProvoke = candidate.adjacentUnits.filter(u =>
      u.modifiers.has(ProvokeUnitModifier)
    );

    if (adjacentAlliesWithProvoke.length > 0) {
      const [topMost] = adjacentAlliesWithProvoke.sort((a, b) => a.y - b.y);
      if (topMost.equals(this.target)) {
        await this.target.takeDamage(event.data.from, event.data.damage);
      }
    } else {
      await this.target.takeDamage(event.data.from, event.data.damage);
    }
  }

  private shouldBeProtected(candidate: Unit): boolean {
    if (candidate.isEnemy(this.target)) return false;
    return this.target.adjacentUnits.some(u => u.equals(candidate));
  }
}
