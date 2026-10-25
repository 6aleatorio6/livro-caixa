import { recurringBillCount } from './recurringBillCount';

describe('recurringBillCount', () => {
  it.each([
    { count: 0, expected: 'Nenhuma conta recorrente' },
    { count: 1, expected: '1 conta recorrente' },
    { count: 2, expected: '2 contas recorrentes' },
    { count: 5, expected: '5 contas recorrentes' },
  ])('Should write $count as "$expected"', ({ count, expected }) => {
    expect(recurringBillCount(count)).toBe(expected);
  });
});
