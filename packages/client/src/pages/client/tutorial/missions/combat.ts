import type { TutorialMission } from '.';

export const combatTutorial: TutorialMission = {
  id: 'combat',
  name: 'Mission 2: Combat',

  options: {
    players: [
      {
        id: 'p1',
        name: 'You',
        deck: {
          cards: []
        }
      },
      {
        id: 'p2',
        name: 'Opponent',
        deck: {
          cards: []
        }
      }
    ],
    rngSeed: 'tutorial-seed',
    history: [],
    config: {
      SHUFFLE_DECK_ON_GAME_START: false,
      INITIAL_HAND_SIZE: 1
    },
    async setup() {},
    steps: {
      root: {
        id: 'root',
        isRoot: true,
        validate() {
          return { status: 'success' };
        },
        next: () => null,
        textBoxes: [
          {
            text: '',
            canGoNext: true,
            top: '50%',
            right: '6%'
          }
        ]
      }
    }
  }
};
