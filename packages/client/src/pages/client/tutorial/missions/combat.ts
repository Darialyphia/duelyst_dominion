import type { TutorialMission } from '.';

export const combatTutorial: TutorialMission = {
  id: 'combat',
  name: 'Mission 2 : Combat',

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
      SHUFFLE_DECK_ON_GAME_START: false
    },
    async setup() {
      // client.ui.displayedElements.artifacts = false;
      // client.ui.displayedElements.destinyPhaseModal = false;
      // client.ui.displayedElements.phaseTracker = false;
    },
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
            text: 'Welcome to the Clashing Destinies tutorial!',
            canGoNext: true,
            top: '25%',
            left: '50%',
            centered: { x: true }
          }
        ]
      }
    }
  }
};
