/// <reference lib="webworker" />
import type { Point } from '@game/shared';
import type { Rune } from '@game/engine/src/card/card.enums';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { match } from 'ts-pattern';

type SandboxWorkerEvent =
  | {
      type: 'init';
      payload: {
        options: Pick<GameOptions, 'players' | 'rngSeed'>;
      };
    }
  | { type: 'dispatch'; payload: { input: SerializedInput } }
  | { type: 'debug' }
  | { type: 'rewind'; payload: { step: number } }
  | {
      type: 'addCardtoHand';
      payload: { blueprintId: string; playerId: string };
    }
  | { type: 'refillMana'; payload: { playerId: string } }
  | { type: 'addRune'; payload: { playerId: string; rune: Rune } }
  | { type: 'setMaxMana'; payload: { playerId: string; amount: number } }
  | { type: 'moveUnit'; payload: { unitId: string; position: Point } }
  | { type: 'activateUnit'; payload: { unitId: string } }
  | { type: 'destroyUnit'; payload: { unitId: string; silent: boolean } };

let game: Game;
self.addEventListener('message', ({ data }) => {
  const options = data as SandboxWorkerEvent;

  match(options)
    .with({ type: 'debug' }, () => {
      console.log(game);
    })
    .with({ type: 'init' }, async ({ payload }) => {
      game = new Game({
        id: 'sandbox',
        rngSeed: payload.options.rngSeed,
        history: [],
        overrides: {
          cardPool: CARDS_DICTIONARY
        },
        players: payload.options.players,
        enableSnapshots: true
      });

      await game.initialize();
      self.postMessage({
        type: 'ready',
        payload: {
          snapshot: game.snapshotSystem.getLatestOmniscientSnapshot()
        }
      });
      game.subscribeOmniscient(snapshot => {
        // helper to find malformed events that would break structuredClone
        snapshot.events.forEach(event => {
          try {
            JSON.stringify(event);
          } catch {
            console.error('Error stringifying event:', event.eventName, event);
          }
        });

        self.postMessage({
          type: 'update',
          payload: snapshot
        });
      });
    })
    .with({ type: 'dispatch' }, async ({ payload }) => {
      game.dispatch(payload.input);
    })
    .with({ type: 'rewind' }, async ({ payload }) => {
      if (!game) {
        console.warn('Game not initialized yet, cannot rewind');
      }
      const history = game.inputSystem.serialize().slice(0, payload.step + 1);
      game = new Game({ ...game.options, history });

      await game.initialize();
      self.postMessage({
        type: 'ready',
        payload: {
          snapshot: game.snapshotSystem.getLatestOmniscientSnapshot(),
          history: game.inputSystem.serialize()
        }
      });

      game.subscribeOmniscient(snapshot => {
        // helper to find malformed events that would break structuredClone
        snapshot.events.forEach(event => {
          try {
            JSON.stringify(event);
          } catch {
            console.error('Error stringifying event:', event.eventName, event);
          }
        });

        self.postMessage({
          type: 'update',
          payload: snapshot
        });
      });
    })
    .with({ type: 'addCardtoHand' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      const card = await player.generateCard(payload.blueprintId, false);
      await card.addToHand();
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'refillMana' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      player.refillMana();
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'addRune' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      player.gainRune(payload.rune, 1);
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'setMaxMana' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      player.gainMaxMana(payload.amount - player.maxMana);
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'moveUnit' }, async ({ payload }) => {
      const unit = game.unitSystem.getUnitById(payload.unitId);
      if (!unit) {
        return;
      }
      await unit.teleport(payload.position, true);
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'activateUnit' }, async ({ payload }) => {
      const unit = game.unitSystem.getUnitById(payload.unitId);
      if (!unit) {
        return;
      }
      await unit.activate();
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'destroyUnit' }, async ({ payload }) => {
      const unit = game.unitSystem.getUnitById(payload.unitId);
      if (!unit) {
        return;
      }
      await unit.destroy(unit.player.general.card, payload.silent);
      game.snapshotSystem.takeSnapshot();
    })
    .exhaustive();
});
