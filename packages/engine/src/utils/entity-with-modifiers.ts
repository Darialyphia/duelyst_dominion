import { Entity } from '../entity';
import { ModifierManager } from '../modifier/modifier-manager.component';
import type { Interceptable } from './interceptable';

export abstract class EntityWithModifiers<
  TI extends Record<string, Interceptable<any, any>>
> extends Entity<TI> {
  modifiers: ModifierManager<this>;

  constructor(id: string, interceptables: TI) {
    super(id, interceptables);
    this.modifiers = new ModifierManager(this);
  }
}
