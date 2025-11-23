import type { Game } from '../../..';

export type FilterCandidateSelectionType =
  | {
      type: 'all';
    }
  | {
      type: 'random';
      count: number;
    };

export type Filter<T> = FilterCandidateSelectionType & { groups: T[][] };

export const resolveFilter = <TFilter, TResult>(
  game: Game,
  filter: Filter<TFilter>,
  getResults: () => TResult[]
): TResult[] => {
  const results = getResults();
  if (filter.type === 'random' && results.length) {
    const selected: TResult[] = [];
    const usedIndices = new Set<number>();
    while (selected.length < filter.count && usedIndices.size < results.length) {
      const index = game.rngSystem.nextInt(results.length - 1);
      if (usedIndices.has(index)) continue;
      usedIndices.add(index);
      selected.push(results[index]);
    }
    return selected;
  }

  return results;
};
