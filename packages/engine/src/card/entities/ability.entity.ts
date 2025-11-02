import type { Serializable } from '@game/shared';
import type { Game } from '../../game/game';
import type { AbilityBlueprint } from '../card-blueprint';
import type { AnyCard } from './card.entity';

export type SerializedAbility = {
  id: string;
  canUse: boolean;
  description: string;
  cooldown: number;
  manaCost: number;
  lastUsedAt: number | null;
};

export class Ability<T extends AnyCard> implements Serializable<SerializedAbility> {
  private lastUsedAt: number | null = null;

  private useCount = 0;

  constructor(
    private game: Game,
    private card: T,
    public blueprint: AbilityBlueprint<T>
  ) {}

  get id() {
    return this.blueprint.id;
  }

  get isOnCooldown() {
    if (this.lastUsedAt === null) {
      return false;
    }
    return (
      this.lastUsedAt + this.blueprint.getCooldown(this.game, this.card) >
      this.game.gamePhaseSystem.elapsedTurns
    );
  }

  get hasReachedMaxUses() {
    return this.useCount >= this.blueprint.getMaxUses(this.game, this.card);
  }

  get canUse() {
    return (
      this.blueprint.canUse(this.game, this.card) &&
      this.card.player.manaManager.canSpend(this.blueprint.manaCost) &&
      !this.isOnCooldown &&
      !this.hasReachedMaxUses
    );
  }

  async use() {
    this.lastUsedAt = this.game.gamePhaseSystem.elapsedTurns;

    this.card.player.manaManager.spend(this.blueprint.manaCost);
    const targets = await this.blueprint.getTargets(this.game, this.card);
    const aoe = this.blueprint.getAoe(this.game, this.card, targets);

    await this.blueprint.onResolve(this.game, this.card, {
      targets,
      aoe
    });

    this.useCount++;
  }

  serialize(): SerializedAbility {
    return {
      id: this.id,
      canUse: this.canUse,
      description: this.blueprint.description,
      cooldown: this.blueprint.getCooldown(this.game, this.card),
      manaCost: this.blueprint.manaCost,
      lastUsedAt: this.lastUsedAt
    };
  }
}
