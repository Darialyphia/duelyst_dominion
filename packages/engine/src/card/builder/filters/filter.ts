import type { Game } from '../../..';

export type Filter<T> = { groups: T[][]; type: 'all' | 'random'; count?: number };

export const resolveFilter = <TFilter, TResult>(
  game: Game,
  filter: Filter<TFilter>,
  getResults: () => TResult[]
): TResult[] => {
  const results = getResults();
  if (filter.type === 'random' && results.length) {
    const selected: TResult[] = [];
    const usedIndices = new Set<number>();
    const count = filter.count ?? 1;
    while (selected.length < count && usedIndices.size < results.length) {
      const index = game.rngSystem.nextInt(results.length - 1);
      if (usedIndices.has(index)) continue;
      usedIndices.add(index);
      selected.push(results[index]);
    }
    return selected;
  }

  return results;
};
