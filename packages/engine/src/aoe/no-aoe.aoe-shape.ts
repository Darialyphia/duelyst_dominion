import type { Unit } from '../unit/unit.entity';
import type { AOEShape } from './aoe-shapes';

export class NoAOEShape implements AOEShape {
  getCells() {
    return [];
  }

  getUnits(): Unit[] {
    return [];
  }
}
