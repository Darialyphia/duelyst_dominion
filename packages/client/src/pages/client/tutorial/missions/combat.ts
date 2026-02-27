import type { TutorialMission } from '.';
import { Game } from '@game/engine';
import { waitFor } from '@game/shared';
import { simpleStepValidation } from './utils';
import { bloodshardGolem } from '@game/engine/src/card/sets/core/neutral/bloodshard-golem';
import { hailstoneGolem } from '@game/engine/src/card/sets/core/neutral/hailstone-golem';
import { brightmossGolem } from '@game/engine/src/card/sets/core/neutral/brightmoss-golem';
import { argeonHighmane } from '@game/engine/src/card/sets/core/f1/argeon-highmane';
import { kaleosXaan } from '@game/engine/src/card/sets/core/f2/kaleos-xaan';
import type { MinionCard } from '@game/engine/src/card/entities/minion-card.entity';
import { until } from '@vueuse/core';

const meta: {
  game: Game | null;
  p1Unit1Id: string | null;
  p1Unit2Id: string | null;
  p2Unit1Id: string | null;
  p2Unit2Id: string | null;
} = {
  game: null,
  p1Unit1Id: null,
  p1Unit2Id: null,
  p2Unit1Id: null,
  p2Unit2Id: null
};

export const combatTutorial: TutorialMission = {
  id: 'combat',
  name: 'Mission 2: Combat',

  options: {
    players: [
      {
        id: 'p1',
        name: 'You',
        deck: {
          cards: [{ blueprintId: argeonHighmane.id, isFoil: false }]
        }
      },
      {
        id: 'p2',
        name: 'Opponent',
        deck: {
          cards: [{ blueprintId: kaleosXaan.id, isFoil: false }]
        }
      }
    ],
    rngSeed: 'tutorial-combat-seed',
    history: [],
    config: {
      SHUFFLE_DECK_ON_GAME_START: false,
      INITIAL_HAND_SIZE: 0
    },
    async setup(game) {
      meta.game = game;
    },
    steps: {
      root: {
        id: 'root',
        isRoot: true,
        validate(input) {
          return simpleStepValidation(
            z =>
              z.object({
                type: z.literal('attack'),
                payload: z.object({
                  unitId: z.literal(meta.p1Unit1Id),
                  x: z.literal(2),
                  y: z.literal(1)
                })
              }),
            'Attack the enemy unit with your Hailstone Golem.'
          )(input);
        },
        next: () => 'retaliation_explain',
        async onEnter(game) {
          // Remove generals from the board — this tutorial focuses on combat only
          for (const player of game.playerSystem.players) {
            await player.generalCard.removeFromCurrentLocation();
          }

          const p1 = game.playerSystem.player1;
          const p2 = game.playerSystem.player2;

          // Place P1's Hailstone Golem on the front row at column 2
          const p1Card1 = await p1.generateCard<MinionCard>(
            hailstoneGolem.id,
            false
          );
          await p1Card1.playAt(game.boardSystem.getCellAt({ x: 2, y: 2 })!, []);
          const p1Unit1 = p1Card1.unit;
          p1Unit1.wakeUp();
          meta.p1Unit1Id = p1Unit1.id;

          // Place P2's Bloodshard Golem on the front row at same column (x=2)
          const p2Card1 = await p2.generateCard<MinionCard>(
            bloodshardGolem.id,
            false
          );
          await p2Card1.playAt(game.boardSystem.getCellAt({ x: 2, y: 1 })!, []);
          const p2Unit1 = p2Card1.unit;
          p2Unit1.wakeUp();
          meta.p2Unit1Id = p2Unit1.id;

          await game.snapshotSystem.takeSnapshot();
        },
        textBoxes: [
          {
            text: "Welcome to the combat tutorial! In this mission, you'll learn how units fight each other.",
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: 'Units have three combat stats: <b style="color: var(--red-4)">Attack</b>, <b style="color: var(--green-4)">Retaliation</b>, and <b style="color: var(--blue-4)">HP</b>.',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: '<b style="color: var(--red-4)">Attack</b> is the damage a unit deals when it attacks. <b style="color: var(--green-4)">Retaliation</b> is the damage it deals when it fights back.',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: 'Your <b style="color: var(--green-4)">Hailstone Golem</b> (3 atk / 3 retaliation / 7 hp) is facing an enemy <b style="color: var(--red-4)">Bloodshard Golem</b> (2 atk / 2 retaliation / 6 hp).',
            canGoNext: true,
            top: '58%',
            left: '20%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.unit(
                meta.p1Unit1Id!
              ).element;
            }
          },
          {
            text: 'Select your Hailstone Golem.',
            canGoNext: false,
            top: '58%',
            left: '20%',
            async onEnter(game, client, next) {
              await until(
                () => client.ui.selectedUnit?.id === meta.p1Unit1Id
              ).toBeTruthy();
              next();
            }
          },
          {
            text: 'Units can only attack enemies <b style="color: var(--green-4)">in the same column</b>.',
            canGoNext: true,
            top: '58%',
            left: '20%',
            async onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'Click on the enemy Bloodshard Golem to attack it.',
            canGoNext: false,
            top: '58%',
            left: '20%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.unit(
                meta.p2Unit1Id!
              ).element;
            }
          }
        ]
      },

      // ============================================================
      // STEP 3: Explain retaliation after the first attack
      // ============================================================
      retaliation_explain: {
        id: 'retaliation_explain',
        isRoot: false,
        next: () => 'opponent_attacks_target',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('attack'),
              payload: z.object({
                unitId: z.literal(meta.p2Unit1Id),
                playerId: z.literal('p2')
              })
            }),
          'Waiting for opponent to attack...'
        ),
        textBoxes: [
          {
            text: "You dealt <b style='color: var(--red-4)'>3 damage</b> to the Bloodshard Golem with your attack!",
            canGoNext: true,
            top: '50%',
            right: '6%',
            onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.unit(
                meta.p2Unit1Id!
              ).element;
            }
          },
          {
            text: "But the enemy fought back! It dealt <b style='color: var(--green-4)'>2 retaliation damage</b> to your Hailstone Golem.",
            canGoNext: true,
            top: '58%',
            right: '6%',
            onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.unit(
                meta.p1Unit1Id!
              ).element;
            }
          },
          {
            text: 'Combat is not free! When you attack, the defender <b style="color: var(--green-4)">retaliates</b> and deals damage back using their retaliation stat.',
            canGoNext: true,
            top: '50%',
            right: '6%',

            onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'Attacking also <b style="color: var(--green-4)">exhausts</b> the unit, so it is not able to act again this turn.',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: "It is now your opponent's turn to act.The opponent's Bloodshard Golem will now attack your Hailstone Golem.",
            canGoNext: true,
            top: '50%',
            right: '6%',
            onLeave(game, client) {
              // Opponent attacks back
              client.dispatch({
                type: 'attack',
                payload: {
                  playerId: 'p2',
                  unitId: meta.p2Unit1Id!,
                  x: 2,
                  y: 2
                }
              });
            }
          }
        ]
      },

      // ============================================================
      // STEP 5: Destroy the weakened enemy
      // ============================================================
      opponent_attacks_target: {
        id: 'opponent_attacks_target',
        isRoot: false,
        next: () => 'destroy_select_target',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('attack'),
              payload: z.object({
                unitId: z.literal(meta.p1Unit1Id)
              })
            }),
          'Attack the weakened Bloodshard Golem to destroy it!'
        ),
        textBoxes: [
          {
            text: "The enemy dealt <b style='color: var(--red-4)'>2 damage</b> to your Hailstone Golem, but your golem retaliated for <b style='color: var(--green-4)'>3 damage</b>!",
            canGoNext: true,
            top: '50%',
            right: '6%',

            onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'Notice that your Hailstone Golem has higher retaliation (3) than the Bloodshard Golem (2). A unit with high retaliation is better at defending!',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: 'The enemy Bloodshard Golem is now very low on HP. Attack it to destroy it!',
            canGoNext: false,
            top: '58%',
            left: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.unit(
                meta.p1Unit1Id!
              ).element;
            }
          }
        ]
      },
      destroy_select_target: {
        id: 'destroy_select_target',
        isRoot: false,
        next: () => 'destroy_result',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('selectSpaceOnBoard'),
              payload: z.object({
                x: z.literal(2),
                y: z.literal(1)
              })
            }),
          'Click on the enemy Bloodshard Golem to destroy it.'
        ),
        textBoxes: [
          {
            text: 'Click on the enemy <b style="color: var(--red-4)">Bloodshard Golem</b> to finish it off!',
            canGoNext: false,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.cell(
                2,
                1
              ).element;
            }
          }
        ]
      },
      destroy_result: {
        id: 'destroy_result',
        isRoot: false,
        next: () => 'direct_attack_setup',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('pass'),
              payload: z.object({
                playerId: z.literal('p2')
              })
            }),
          'Waiting for opponent to pass...'
        ),
        textBoxes: [
          {
            text: "When a unit's HP reaches 0, it is <b style='color: var(--red-4)'>destroyed</b> and removed from the board.",
            canGoNext: true,
            top: '50%',
            right: '6%',

            onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'The enemy Bloodshard Golem has been destroyed! The opponent has no units left to act with.',
            canGoNext: false,
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

      // ============================================================
      // STEP 6: Direct attack on the player
      // ============================================================
      direct_attack_setup: {
        id: 'direct_attack_setup',
        isRoot: false,
        next: () => 'direct_attack_select_target',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('attack'),
              payload: z.object({
                unitId: z.literal(meta.p1Unit1Id)
              })
            }),
          'Attack the opponent directly with your Hailstone Golem.'
        ),
        textBoxes: [
          {
            text: 'With no enemy units in the column, your unit can now attack the <b style="color: var(--red-4)">opponent player directly</b>!',
            canGoNext: true,
            top: '50%',
            right: '6%',

            onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'The opponent has <b style="color: var(--blue-4)">25 HP</b>. Dealing damage to the opponent is how you win the game!',
            canGoNext: true,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement =
                client.ui.DOMSelectors.heroHealthIndicator('p2').element;
            }
          },
          {
            text: 'Click on your <b style="color: var(--green-4)">Hailstone Golem</b> to select it, then attack the opponent.',
            canGoNext: false,
            top: '58%',
            left: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.unit(
                meta.p1Unit1Id!
              ).element;
            }
          }
        ]
      },

      direct_attack_select_target: {
        id: 'direct_attack_select_target',
        isRoot: false,
        next: () => 'positioning_setup',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('selectSpaceOnBoard'),
              payload: z.object({
                x: z.literal(2),
                y: z.literal(1)
              })
            }),
          "Click on the opponent's side of the board to attack them directly."
        ),
        textBoxes: [
          {
            text: "Now click on the opponent's front row tile to deal damage directly to them. The opponent <b>cannot retaliate</b> against direct attacks!",
            canGoNext: false,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.cell(
                2,
                1
              ).element;
            }
          }
        ]
      },

      // ============================================================
      // STEP 7: Positioning — front row vs back row
      // ============================================================
      positioning_setup: {
        id: 'positioning_setup',
        isRoot: false,
        next: () => 'positioning_select_target',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('attack'),
              payload: z.object({
                unitId: z.literal(meta.p1Unit1Id)
              })
            }),
          'Attack the enemy front row unit.'
        ),
        async onEnter(game, _step, client) {
          // Opponent passes their turn
          await client.dispatch({
            type: 'pass',
            payload: { playerId: 'p2' }
          });
          // Both players pass => new turn starts
          await client.dispatch({
            type: 'pass',
            payload: { playerId: 'p1' }
          });

          // Now set up the positioning scenario:
          // remove the old P1 unit from the board
          const oldUnit = game.unitSystem.getUnitById(meta.p1Unit1Id!);
          if (oldUnit) {
            await oldUnit.destroy(oldUnit.card, true);
          }

          const p1 = game.playerSystem.player1;
          const p2 = game.playerSystem.player2;

          // Place a Brightmoss Golem for P1 on front row (x=2, y=2)
          const p1Card = await p1.generateCard<MinionCard>(
            brightmossGolem.id,
            false
          );
          await p1Card.playAt(game.boardSystem.getCellAt({ x: 2, y: 2 })!, []);
          const p1Unit = p1Card.unit;
          p1Unit.wakeUp();
          meta.p1Unit1Id = p1Unit.id;

          // Place P2 front row unit (x=2, y=1) — a Bloodshard Golem to block
          const p2FrontCard = await p2.generateCard<MinionCard>(
            bloodshardGolem.id,
            false
          );
          await p2FrontCard.playAt(
            game.boardSystem.getCellAt({ x: 2, y: 1 })!,
            []
          );
          const p2FrontUnit = p2FrontCard.unit;
          p2FrontUnit.wakeUp();
          meta.p2Unit1Id = p2FrontUnit.id;

          // Place P2 back row unit (x=2, y=0) — a Hailstone Golem behind
          const p2BackCard = await p2.generateCard<MinionCard>(
            hailstoneGolem.id,
            false
          );
          await p2BackCard.playAt(
            game.boardSystem.getCellAt({ x: 2, y: 0 })!,
            []
          );
          const p2BackUnit = p2BackCard.unit;
          p2BackUnit.wakeUp();
          meta.p2Unit2Id = p2BackUnit.id;

          await game.snapshotSystem.takeSnapshot();
        },
        textBoxes: [
          {
            text: "<b style='color: var(--green-4)'>Positioning matters!</b> The board has a front row and a back row for each player.",
            canGoNext: true,
            top: '50%',
            right: '6%',

            onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'The enemy has two units on the same column: a <b style="color: var(--red-4)">Bloodshard Golem</b> on the front row, and a <b style="color: var(--red-4)">Hailstone Golem</b> hiding on the back row.',
            canGoNext: true,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.unit(
                meta.p2Unit2Id!
              ).element;
            }
          },
          {
            text: 'Melee units can only attack the <b style="color: var(--green-4)">closest enemy</b> in their column. You must defeat the front row unit before you can reach the one behind it.',
            canGoNext: true,
            top: '50%',
            right: '6%',

            onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: 'Attack the enemy <b style="color: var(--red-4)">Bloodshard Golem</b> on the front row!',
            canGoNext: false,
            top: '58%',
            left: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.unit(
                meta.p1Unit1Id!
              ).element;
            }
          }
        ]
      },

      positioning_select_target: {
        id: 'positioning_select_target',
        isRoot: false,
        next: () => 'positioning_result',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('selectSpaceOnBoard'),
              payload: z.object({
                x: z.literal(2),
                y: z.literal(1)
              })
            }),
          'Click on the Bloodshard Golem to attack it.'
        ),
        textBoxes: [
          {
            text: 'Click on the <b style="color: var(--red-4)">Bloodshard Golem</b> on the front row to attack it.',
            canGoNext: false,
            top: '50%',
            right: '6%',
            async onEnter(game, client) {
              client.ui.highlightedElement = client.ui.DOMSelectors.cell(
                2,
                1
              ).element;
            }
          }
        ]
      },

      positioning_result: {
        id: 'positioning_result',
        isRoot: false,
        next: () => 'wrapup',
        validate: simpleStepValidation(
          z =>
            z.object({
              type: z.literal('pass'),
              payload: z.object({
                playerId: z.literal('p2')
              })
            }),
          'Waiting for opponent...'
        ),
        textBoxes: [
          {
            text: "Good! You attacked the front row blocker. The enemy's back row Hailstone Golem is safe for now — you'd need to clear the front row first to reach it.",
            canGoNext: true,
            top: '50%',
            right: '6%',

            onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: '<b style="color: var(--green-4)">Tip:</b> Place fragile or important units on the back row to protect them behind tougher front row units!',
            canGoNext: false,
            top: '50%',
            right: '6%',

            onLeave(game, client) {
              client.dispatch({
                type: 'pass',
                payload: { playerId: 'p2' }
              });
            }
          }
        ]
      },

      // ============================================================
      // STEP 8: Wrap up
      // ============================================================
      wrapup: {
        id: 'wrapup',
        isRoot: false,
        next: () => null,
        validate: () => ({ status: 'success' }),
        textBoxes: [
          {
            text: "<b style='color: var(--green-4)'>Great job!</b> Let's review what you learned:",
            canGoNext: true,
            top: '50%',
            right: '6%',

            onEnter(game, client) {
              client.ui.highlightedElement = null;
            }
          },
          {
            text: '1. Units attack enemies in their <b>same column</b>. They can only target the <b>closest</b> enemy.',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: '2. When attacked, the defender <b style="color: var(--green-4)">retaliates</b> using their retaliation stat — combat is not free!',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: '3. If no enemy unit blocks the column, you can <b style="color: var(--red-4)">attack the opponent directly</b>.',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: '4. Use the <b>front row</b> to protect fragile back row units. Position matters!',
            canGoNext: true,
            top: '50%',
            right: '6%'
          },
          {
            text: "This concludes the combat tutorial. Some units have special abilities that change how combat works — you'll discover those as you play!",
            canGoNext: false,
            top: '50%',
            right: '6%'
          }
        ]
      }
    }
  }
};
