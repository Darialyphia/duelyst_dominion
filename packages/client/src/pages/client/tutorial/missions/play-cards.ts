import { argeonHighmane } from '@game/engine/src/card/sets/core/f1/argeon-highmane';
import type { TutorialMission } from '.';
import { windbladeAdept } from '@game/engine/src/card/sets/core/f1/windblade-adept';
import { kaleosXaan } from '@game/engine/src/card/sets/core/f2/kaleos-xaan';
import { Game } from '@game/engine';
import { waitFor } from '@game/shared';
import { simpleStepValidation } from './utils';
import { kaidoAssassin } from '@game/engine/src/card/sets/core/f2/kaido-assasin';

const meta: {
  game: Game | null;
} = { game: null };

export const playCardTutorial: TutorialMission = {
  id: 'play-card',
  name: 'Need a nugget',
  options: {
    players: [
      {
        id: 'p1',
        name: 'You',
        deck: {
          cards: [
            { blueprintId: argeonHighmane.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false },
            { blueprintId: windbladeAdept.id, isFoil: false }
          ]
        }
      },
      {
        id: 'p2',
        name: 'Opponent',
        deck: {
          cards: [
            { blueprintId: kaleosXaan.id, isFoil: false },
            { blueprintId: kaidoAssassin.id, isFoil: false },
            { blueprintId: kaidoAssassin.id, isFoil: false },
            { blueprintId: kaidoAssassin.id, isFoil: false },
            { blueprintId: kaidoAssassin.id, isFoil: false },
            { blueprintId: kaidoAssassin.id, isFoil: false },
            { blueprintId: kaidoAssassin.id, isFoil: false },
            { blueprintId: kaidoAssassin.id, isFoil: false },
            { blueprintId: kaidoAssassin.id, isFoil: false },
            { blueprintId: kaidoAssassin.id, isFoil: false }
          ]
        }
      }
    ],
    rngSeed: 'tutorial-seed',
    history: [],
    config: {
      SHUFFLE_DECK_ON_GAME_START: false,
      INITIAL_HAND_SIZE: 1
    },
    async setup(game) {
      meta.game = game;
      // client.ui.displayedElements.artifacts = false;
      // client.ui.displayedElements.destinyPhaseModal = false;
      // client.ui.displayedElements.phaseTracker = false;
    },
    steps: {
      root: {
        id: 'root',
        isRoot: true,
        validate(input) {
          return simpleStepValidation(
            z =>
              z.object({
                type: z.literal('playCard'),
                payload: z.object({
                  id: z.literal(
                    meta.game?.playerSystem.player1.cardManager.hand[0].id
                  )
                })
              }),
            'Play the card in your hand.'
          )(input);
        },
        next: () => 'turn1_1',
        async onEnter(game) {
          for (const player of game.playerSystem.players) {
            await player.generalCard.removeFromCurrentLocation();
          }
          game.snapshotSystem.takeSnapshot();
        },
        textBoxes: [
          {
            text: 'Drag the card in your hand to the board to play it.',
            canGoNext: false,
            top: '35%',
            right: '3%',
            async onEnter(game, client) {
              await waitFor(500);
              client.ui.highlightedElement = client.ui.DOMSelectors.cardInHand(
                game.playerSystem.player1.cardManager.hand[0].id,
                'p1'
              ).element;
            }
          }
        ]
      },
      turn1_1: {
        id: 'turn1_1',
        isRoot: false,
        next: () => 'turn1_2',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('selectSpaceOnBoard'),
              payload: z.object({
                x: z.literal(0),
                y: z.literal(2)
              })
            }),
          'Select the highlighted tile on the board.'
        ),
        textBoxes: [
          {
            text: 'Play the card on the highlighted board tile.',
            canGoNext: false,
            top: '35%',
            right: '3%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.cell(
                0,
                2
              ).element;
            }
          }
        ]
      },
      turn1_2: {
        id: 'turn1_2',
        isRoot: false,
        next: () => 'turn1_3',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('playCard'),
              payload: z.object({
                id: z.literal(
                  meta.game!.playerSystem.player2.cardManager.hand[0].id
                )
              })
            }),
          "It is now your opponent's turn. Let them play their card."
        ),
        textBoxes: [
          {
            text: 'In this game, player take turns taking actions. The player who gets to take an action has <b style="color: var(--green-4)">the initiative</b>.',
            canGoNext: true,
            top: '35%',
            right: '3%',
            async onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'The player with the initiative has a yellow border around their player info.',
            canGoNext: true,
            top: '35%',
            right: '3%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.playerInfos(
                game.playerSystem.player2.id
              ).element;
            }
          },
          {
            text: "It is now your opponent's turn to take an action.",
            canGoNext: true,
            top: '35%',
            right: '3%',
            async onEnter(game, client) {
              client.ui.highlightedElement = null;
            },
            async onLeave(game, client) {
              client.dispatch({
                type: 'playCard',
                payload: {
                  id: meta.game!.playerSystem.player2.cardManager.hand[0].id,
                  playerId: 'p2'
                }
              });
            }
          }
        ]
      },
      turn1_3: {
        id: 'turn1_3',
        isRoot: false,
        next: () => null,
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('passTurn'),
              payload: z.object({
                playerId: z.literal('p1')
              })
            }),
          'Pass your turn to your opponent.'
        ),
        async onEnter(game, step, client) {
          // await game.dispatch({
          //   type: 'selectSpaceOnBoard',
          //   payload: {
          //     playerId: 'p2',
          //     x: 0,
          //     y: 1
          //   }
          // });
        },
        textBoxes: [
          {
            text: "You don't have any more cards in your hand, so you can't take any more actions for now.",
            canGoNext: true,
            top: '35%',
            right: '3%'
          },
          {
            text: 'You can press the Pass button to pass initiative to your opponent.',
            canGoNext: true,
            top: '35%',
            right: '3%'
          },
          {
            text: 'Be careful, once you pass, you will not get back initiative this turn.',
            canGoNext: true,
            top: '35%',
            right: '3%'
          },
          {
            text: 'Try passing your turn to your opponent.',
            canGoNext: false,
            top: '35%',
            right: '3%',
            async onEnter(game, client) {
              client.ui.highlightedElement =
                client.ui.DOMSelectors.actionButton('pass').element;
            }
          }
        ]
      }
    }
  }
};
