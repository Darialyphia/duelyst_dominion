export type FilterCandidateSelectionType =
  | {
      type: 'all';
    }
  | {
      type: 'random';
      count: number;
    };

export type Filter<T> = FilterCandidateSelectionType & { groups: T[][] };
