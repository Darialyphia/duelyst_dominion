import type { Override } from '@game/shared';
import type {
  EntityDictionary,
  SerializedOmniscientState,
  SerializedPlayerState,
  SnapshotDiff
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
import type { SerializedCell } from '../../board/entities/board-cell.entity';
import { BoardCellViewModel } from '../view-models/board-cell.model';
import type { SerializedUnit } from '../../unit/unit.entity';
import { UnitViewModel } from '../view-models/unit.model';
import type { SerializedTile } from '../../tile/tile.entity';
import { TileViewModel } from '../view-models/tile.model';
import {
  GAME_EVENTS,
  type SerializedEvent,
  type SerializedStarEvent
} from '../../game/game.events';

export type GameClientState = Override<
  SerializedOmniscientState | SerializedPlayerState,
  {
    entities: GameStateEntities;
  }
>;

export type SerializedEntity =
  | SerializedMinionCard
  | SerializedGeneralCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedPlayer
  | SerializedModifier
  | SerializedCell
  | SerializedUnit
  | SerializedTile;
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

  private buildViewModel(entity: SerializedEntity) {
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
  preupdate(newState: SnapshotDiff) {
    if (!this.state) return;

    for (const id of newState.addedEntities) {
      const entity = newState.entities[id];

      this.state.entities[id] = this.buildViewModel(entity as SerializedEntity);
    }
  }

  update(newState: SnapshotDiff): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { entities, config, board, addedEntities, removedEntities, ...rest } = newState;
    for (const [id, entity] of Object.entries(entities)) {
      if (this.state.entities[id]) {
        this.state.entities[id] = this.state.entities[id].update(entity as any).clone();
      } else {
        this.state.entities[id] = this.buildViewModel(entity as any);
      }
    }

    removedEntities.forEach(id => {
      delete this.state.entities[id];
    });

    this.state = {
      ...this.state,
      ...rest,
      board: { ...this.state.board, ...board },
      config: { ...this.state.config, ...config }
    };
  }

  private async onBeforePlayCard(
    event: {
      event: SerializedEvent<'CARD_BEFORE_PLAY'>;
    },
    flush: (postUpdateCallback?: () => Promise<void>) => Promise<void>
  ) {
    if (!this.state.entities[event.event.card.id]) {
      return;
    }
    const card = this.buildViewModel(event.event.card as any) as CardViewModel;
    this.state.entities[card.id] = card;
    return await flush();
  }

  private async onAfterMinionSummoned(
    event: {
      event: SerializedEvent<'MINION_AFTER_SUMMON'>;
    },
    flush: (postUpdateCallback?: () => Promise<void>) => Promise<void>
  ) {
    if (!this.state.entities[event.event.unit.id]) {
      return;
    }
    const unit = this.buildViewModel(event.event.unit as any) as UnitViewModel;
    this.state.entities[unit.id] = unit;
    if (!this.state.units.includes(unit.id)) {
      this.state.units.push(unit.id);
    }
    this.state = { ...this.state };
    return await flush();
  }

  async onEvent(
    event: SerializedStarEvent,
    flush: (postUpdateCallback?: () => Promise<void>) => Promise<void>
  ) {
    if (event.eventName === GAME_EVENTS.CARD_BEFORE_PLAY) {
      return this.onBeforePlayCard(event, flush);
    }
    if (event.eventName === GAME_EVENTS.MINION_AFTER_SUMMON) {
      return this.onAfterMinionSummoned(event, flush);
    }
    return await flush();
    // if (event.eventName === GAME_EVENTS.ARTIFACT_EQUIPED) {
    //   return this.onArtifactEquiped(event, flush);
    // }
    // if (event.eventName === GAME_EVENTS.EFFECT_CHAIN_EFFECT_ADDED) {
    //   return this.onChainEffectAdded(event, flush);
    // }
  }
}
