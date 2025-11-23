import { match } from 'ts-pattern';

export type NumericOperator = 'equals' | 'more_than' | 'less_than';

export const matchNumericOperator = (
  amount: number,
  reference: number,
  operator: NumericOperator
) => {
  return match(operator)
    .with('equals', () => amount === reference)
    .with('less_than', () => amount < reference)
    .with('more_than', () => amount > reference)
    .exhaustive();
};
