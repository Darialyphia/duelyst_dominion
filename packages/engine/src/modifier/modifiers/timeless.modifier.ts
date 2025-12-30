import type { Game } from '../..';
import { KEYWORDS } from '../../card/card-keywords';
import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { PlayerArtifact } from '../../player/player-artifact.entity';
import { ArtifactEffectModifierMixin } from '../mixins/artifact-effect.mixin';
import { PlayerArtifactInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class TimelessModifier extends Modifier<ArtifactCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<ArtifactCard>[] }
  ) {
    super(KEYWORDS.TIMELESS.id, game, source, {
      name: KEYWORDS.TIMELESS.name,
      description: KEYWORDS.TIMELESS.description,
      icon: 'icons/keywords-timeless',
      mixins: [
        new ArtifactEffectModifierMixin(game, {
          onApplied: async artifact => {
            await artifact.modifiers.add(
              new TimelessArtifactModifier(game, source, { mixins: [] })
            );
          },
          onRemoved: async artifact => {
            await artifact.modifiers.remove(TimelessArtifactModifier);
          },
          ...(options?.mixins ?? [])
        })
      ]
    });
  }
}

export class TimelessArtifactModifier extends Modifier<PlayerArtifact> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<PlayerArtifact>[]; modifierType?: string }
  ) {
    super(options.modifierType ?? KEYWORDS.TIMELESS.id, game, source, {
      name: KEYWORDS.CELERITY.name,
      description: KEYWORDS.CELERITY.description,
      icon: 'icons/keyword-celerity',
      mixins: [
        new PlayerArtifactInterceptorModifierMixin(game, {
          key: 'shouldLoseDurabilityOnGeneralDamage',
          interceptor: value => {
            if (!value) return false;

            return game.gamePhaseSystem.turnPlayer.equals(this.target.player.opponent);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
