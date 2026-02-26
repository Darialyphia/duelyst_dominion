import { argeonHighmane } from '@game/engine/src/card/sets/core/f1/argeon-highmane';
import type { TutorialMission } from '.';
import { windbladeAdept } from '@game/engine/src/card/sets/core/f1/windblade-adept';
import { kaleosXaan } from '@game/engine/src/card/sets/core/f2/kaleos-xaan';
import { Game } from '@game/engine';
import { waitFor } from '@game/shared';
import { simpleStepValidation } from './utils';
import { kaidoAssassin } from '@game/engine/src/card/sets/core/f2/kaido-assasin';
import { brightmossGolem } from '@game/engine/src/card/sets/core/neutral/brightmoss-golem';
import { bloodshardGolem } from '@game/engine/src/card/sets/core/neutral/bloodshard-golem';
import { arrowWhistler } from '@game/engine/src/card/sets/core/neutral/arrow-whistler';

const meta: {
  game: Game | null;
} = { game: null };

export const playCardTutorial: TutorialMission = {
  id: 'play-card',
  name: 'Mission 1: Playing Cards',
  options: {
    players: [
      {
        id: 'p1',
        name: 'You',
        deck: {
          cards: [
            { blueprintId: argeonHighmane.id, isFoil: false },
            { blueprintId: bloodshardGolem.id, isFoil: false },
            { blueprintId: arrowWhistler.id, isFoil: false },
            { blueprintId: brightmossGolem.id, isFoil: false },
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
            top: '50%',
            right: '6%',
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
            top: '50%',
            right: '6%',
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
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'The player with the initiative has a yellow border around their player info.',
            canGoNext: true,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.playerInfos(
                game.playerSystem.player2.id
              ).element;
            }
          },
          {
            text: "It is now your opponent's turn to take an action.",
            canGoNext: true,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = null;
            },
            onLeave(game, client) {
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
        next: () => 'turn1_4',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('selectSpaceOnBoard'),
              payload: z.object({
                playerId: z.literal('p2'),
                x: z.literal(0),
                y: z.literal(1)
              })
            }),
          'Opponent is playing their card'
        ),
        textBoxes: [
          {
            text: "It is now your opponent's turn to take an action.",
            canGoNext: false,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              await waitFor(100);
              await client.dispatch({
                type: 'selectSpaceOnBoard',
                payload: {
                  playerId: 'p2',
                  x: 0,
                  y: 1
                }
              });
            }
          }
        ]
      },
      turn1_4: {
        id: 'turn1_4',
        isRoot: false,
        next: () => 'turn1_5',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('pass'),
              payload: z.object({
                playerId: z.literal('p1')
              })
            }),
          'Pass your turn to your opponent.'
        ),
        textBoxes: [
          {
            text: "You don't have any more cards in your hand, so you can't take any more actions for now.",
            canGoNext: true,
            top: '58%',
            left: '6%'
          },
          {
            text: 'You can press the Pass button to pass initiative to your opponent.',
            canGoNext: true,
            top: '58%',
            left: '6%'
          },
          {
            text: 'Be careful, once you pass, you will not get back initiative this turn.',
            canGoNext: true,
            top: '58%',
            left: '6%'
          },
          {
            text: 'Try passing your turn to your opponent.',
            canGoNext: false,
            top: '58%',
            left: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement =
                client.ui.DOMSelectors.actionButton('pass').element;
            },
            onLeave(game, client) {
              client.ui.highlightedElement = null;
            }
          }
        ]
      },
      turn1_5: {
        id: 'turn1_5',
        isRoot: false,
        next: () => 'turn2_1',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('pass'),
              payload: z.object({
                playerId: z.literal('p2')
              })
            }),
          'Opponent is passing their turn'
        ),
        textBoxes: [
          {
            text: 'Once both players have passed, the turn ends.',
            canGoNext: true,
            top: '50%',
            right: '6%',
            onLeave(game, client) {
              client.dispatch({
                type: 'pass',
                payload: {
                  playerId: 'p2'
                }
              });
            }
          }
        ]
      },
      turn2_1: {
        id: 'turn2_1',
        isRoot: false,
        next: () => 'turn2_2',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('playCard'),
              payload: z.object({
                id: z.string()
              })
            }),
          'Play the card in your hand.'
        ),
        textBoxes: [
          {
            text: 'At the start of each turn, both player draw 2 cards.',
            canGoNext: true,
            top: '58%',
            left: '6%'
          },
          {
            text: 'Cards have a mana cost. You can only play a card if you have enough mana to pay for its cost.',
            canGoNext: true,
            top: '58%',
            left: '6%'
          },
          {
            text: 'Your mana is displayed here. You gain 5 mana every turn, and you can have at most 8 mana.',
            canGoNext: true,
            top: '58%',
            left: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.mana(
                game.playerSystem.player1.id
              ).element;
            }
          },
          {
            text: 'Sicne you ended last turn with 2 mana, you now have 7 mana.',
            canGoNext: true,
            top: '58%',
            left: '6%'
          },
          {
            text: 'You can see the mana cost of the card in the top left corner.',
            canGoNext: true,
            top: '58%',
            left: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = document.querySelector(
                `${
                  client.ui.DOMSelectors.cardInHand(
                    game.playerSystem.player1.cardManager.hand[0].id,
                    'p1'
                  ).selector
                } .mana-cost`
              ) as HTMLElement;
            }
          },
          {
            text: 'Since you started last turn with initiative, your opponent gets to go first this turn.',
            canGoNext: true,
            top: '50%',
            left: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = null;
            },
            onLeave(game, client) {
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
      turn2_2: {
        id: 'turn2_2',
        isRoot: false,
        next: () => 'turn2_3',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('selectSpaceOnBoard'),
              payload: z.object({
                playerId: z.literal('p2'),
                x: z.literal(2),
                y: z.literal(1)
              })
            }),
          'Opponent is playing their card'
        ),
        textBoxes: [
          {
            text: 'Since you started last turn with initiative, your opponent gets to go first this turn.',
            canGoNext: false,
            top: '50%',
            left: '6%',
            async onEnter(game, client) {
              await waitFor(100);
              await client.dispatch({
                type: 'selectSpaceOnBoard',
                payload: {
                  playerId: 'p2',
                  x: 2,
                  y: 1
                }
              });
            }
          }
        ]
      },
      turn2_3: {
        id: 'turn2_3',
        isRoot: false,
        next: () => 'turn2_4',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('playCard'),
              payload: z.object({
                id: z.literal(
                  meta.game!.playerSystem.player1.cardManager.hand[0].id
                )
              })
            }),
          'Play the card in your hand.'
        ),
        textBoxes: [
          {
            text: 'Some minions have effects to target other cards or spaces on the board when you play them.',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: 'When that happens, you choose the target after choosing where to play the minion.',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: 'Play the <b style="color: var(--green-4)">Arrow Whistler</b> in your hand.',
            canGoNext: false,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.cardInHand(
                game.playerSystem.player1.cardManager.hand[0].id,
                'p1'
              ).element;
            }
          }
        ]
      },
      turn2_4: {
        id: 'turn2_4',
        isRoot: false,
        next: () => 'turn2_5',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('selectSpaceOnBoard'),
              payload: z.object({
                x: z.literal(2),
                y: z.literal(2)
              })
            }),
          "Select the highlighted minion on the board as the target for your opponent's minion's effect."
        ),
        textBoxes: [
          {
            text: 'Play the card on the highlighted board tile.',
            canGoNext: false,
            top: '55%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.cell(
                2,
                2
              ).element;
            }
          }
        ]
      },
      turn2_5: {
        id: 'turn2_5',
        isRoot: false,
        next: () => 'turn2_6',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('selectSpaceOnBoard'),
              payload: z.object({
                x: z.literal(2),
                y: z.literal(1)
              })
            }),
          "Select the highlighted minion on the board as the target for your opponent's minion's effect."
        ),
        textBoxes: [
          {
            text: 'When you play Arrow Whistler, you can deal damage to an enemy on the same column.',
            canGoNext: true,
            top: '55%',
            left: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'Target the opponent\'s <b style="color: var(--green-4)">Kaido Assassin</b> in the same column.',
            canGoNext: false,
            top: '55%',
            left: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.cell(
                2,
                1
              ).element;
            }
          }
        ]
      },
      turn2_6: {
        id: 'turn2_6',
        isRoot: false,
        next: () => null,
        validate: () => ({ status: 'success' }),
        textBoxes: [
          {
            text: 'Great job! You have successfully played a card with a <b style="color: var(--green-4)">On Enter Effect</b>.',
            canGoNext: true,
            top: '50%',
            right: '6%',
            onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'This concludes the first mission of the tutorial. In the next mission, we will learn about combat.',
            canGoNext: false,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.dispatch({
                type: 'pass',
                payload: {
                  playerId: 'p2'
                }
              });
            }
          }
        ]
      }
    }
  }
};
