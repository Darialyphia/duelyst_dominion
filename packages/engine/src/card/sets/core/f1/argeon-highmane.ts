import type { GeneralBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, FACTIONS, RARITIES } from '../../../card.enums';

export const argeonHighmane: GeneralBlueprint = {
  id: 'argeon-highmane',
  name: 'Argeon Highmane',
  description: 'Allied minions nearby captured Shrines have +1 Atk and +1 Hp.',
  sprite: {
    id: 'generals/f1_argeon-highmane',
    animations: {
      attack: {
        startFrame: 0,
        endFrame: 22
      },
      breathing: {
        startFrame: 23,
        endFrame: 34
      },
      cast: {
        startFrame: 35,
        endFrame: 46
      },
      castend: {
        startFrame: 47,
        endFrame: 49
      },
      castloop: {
        startFrame: 50,
        endFrame: 53
      },
      caststart: {
        startFrame: 54,
        endFrame: 62
      },
      death: {
        startFrame: 63,
        endFrame: 74
      },
      hit: {
        startFrame: 75,
        endFrame: 77
      },
      idle: {
        startFrame: 78,
        endFrame: 88
      },
      run: {
        startFrame: 89,
        endFrame: 96
      }
    },
    frameSize: { w: 100, h: 100 },
    frameDuration: 64
  },
  kind: CARD_KINDS.GENERAL,
  collectable: true,
  setId: CARD_SETS.CORE,
  faction: FACTIONS.F1,
  rarity: RARITIES.BASIC,
  tags: [],
  atk: 2,
  cmd: 1,
  maxHp: 15,
  abilities: [],
  async onInit() {}
};
