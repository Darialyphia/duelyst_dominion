import type { Override } from '@game/shared';
import type {
  EntityDictionary,
  SerializedOmniscientState,
  SerializedPlayerState
} from '../../game/systems/game-snapshot.system';
import { CardViewModel } from '../view-models/card.model';
import { ModifierViewModel } from '../view-models/modifier.model';
import { PlayerViewModel } from '../view-models/player.model';
import { match } from 'ts-pattern';
import type { GameClient, GameStateEntities } from '../client';
import type { SerializedArtifactCard } from '../../card/entities/artifact-card.entity';
import type { SerializedSpellCard } from '../../card/entities/spell-card.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedMinionCard } from '../../card/entities/minion-card.entity';
import type { SerializedGeneralCard } from '../../card/entities/general-card.entity';
import type { SerializedCell } from '../../board/board-cell.entity';
import { BoardCellViewModel } from '../view-models/board-cell.model';
import type { SerializedUnit } from '../../unit/unit.entity';
import { UnitViewModel } from '../view-models/unit.model';
import type { SerializedTile } from '../../tile/tile.entity';
import { TileViewModel } from '../view-models/tile.model';

export type GameClientState = Override<
  SerializedOmniscientState | SerializedPlayerState,
  {
    entities: GameStateEntities;
  }
>;

export class ClientStateController {
  state!: GameClientState;

  constructor(private client: GameClient) {}

  initialize(initialState: SerializedPlayerState | SerializedOmniscientState) {
    this.state = {
      ...initialState,
      entities: {}
    };
    this.state.entities = this.buildentities(initialState.entities);
  }

  private buildViewModel(
    entity:
      | SerializedMinionCard
      | SerializedGeneralCard
      | SerializedSpellCard
      | SerializedArtifactCard
      | SerializedPlayer
      | SerializedModifier
      | SerializedCell
      | SerializedTile
      | SerializedUnit
  ) {
    const dict: GameClientState['entities'] = this.state?.entities ?? {};

    return match(entity)
      .with(
        { entityType: 'player' },
        entity => new PlayerViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'card' },
        entity => new CardViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'modifier' },
        entity => new ModifierViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'cell' },
        entity => new BoardCellViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'unit' },
        entity => new UnitViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'tile' },
        entity => new TileViewModel(entity, dict, this.client)
      )
      .exhaustive();
  }

  private buildentities = (entities: EntityDictionary): GameClientState['entities'] => {
    const dict: GameClientState['entities'] = this.state?.entities ?? {};
    for (const [id, entity] of Object.entries(entities)) {
      dict[id] = this.buildViewModel(entity);
    }
    return dict;
  };

  // prepopulate the state with new entities because they could be used by the fx events
  preupdate(newState: SerializedPlayerState | SerializedOmniscientState) {
    if (!this.state) return;

    for (const [id, entity] of Object.entries(newState.entities)) {
      const existingEntity = this.state.entities[id];
      if (existingEntity) continue;
      this.state.entities[entity.id] = this.buildViewModel(entity);
    }
  }

  update(newState: SerializedPlayerState | SerializedOmniscientState): void {
    this.state = {
      ...newState,
      entities: this.buildentities(newState.entities)
    };
  }
}
